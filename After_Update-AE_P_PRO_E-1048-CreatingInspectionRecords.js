"use strict";
//@author Victor Verduzco
//@Creation Date May 2023
//@Jira CD-4824
//@Customer: Texas A&M University
//Type: AFTER Update
//Table: AE_P_Pro_E

/**
 * Change Log*
 ******************************************************************************************************************************
 * 05/09/2023   Victor Verduzco -Initial release.
 ******************************************************************************************************************************
 */

const MODULE_PATH = standardModulePath;
bootStrapRequire();

const ACTION_CODE_TITLE = "ABP WO creating Inspection Records";
const VERSION = "1.0";
const LOG_MSG_PREFIX = ACTION_CODE_TITLE + " " + VERSION + " ";

const configuration = require(MODULE_PATH + "action-code-configuration_1.4");
const logMessage = require(MODULE_PATH + "log-message_1.0");

const configInstance = configuration.createTriggeredInstance(actionCodeDocument);
const DEBUG = configInstance.get("DEBUG", false);
const WORKORDER_STATUS = configInstance.get("WORKORDER_STATUS", "FC REVIEW");
const INSPECTION_TYPE = configInstance.get("INSPECTION_TYPE");
const INSPECTION_STATUS = configInstance.get("INSPECTION_STATUS");


const Application = Java.type("com.maximus.fmax.common.framework.util.Application");
const AssetMgtFacade = Java.type("com.maximus.fmax.assetmgt.AssetMgtFacade");
const StatusFacade = Java.type("com.maximus.fmax.common.status.StatusFacade");
const AeAmInspectionEDTO = Java.type("com.maximus.fmax.assetmgt.dto.AeAmInspectionEDTO");
const AePPstCPK = Java.type("com.maximus.fmax.common.status.dto.AePPstCPK");
const AeAmInspectionTypeEPK = Java.type("com.maximus.fmax.assetmgt.dto.AeAmInspectionTypeEPK");

const CONTEXT = Application.getInstance().getContext();
const GLOBAL_AssetFacade = new AssetMgtFacade(CONTEXT);
const GLOBAL_StatusFacade = new StatusFacade(CONTEXT);

//Singletons are initialized just once across all modules.
logMessage.init(LOG_MSG_PREFIX, DEBUG);

/*********************************************************/
logMessage.getInstance().logMessage("Start");
runScript();
logMessage.getInstance().logMessage("End");

/*********************************************************/

function runScript() {
    if ((oldDocument && oldDocument.getStatusCode() == WORKORDER_STATUS) || newDocument.getStatusCode() != WORKORDER_STATUS) {
        //Status not newly set to FC REVIEW, or not set to FC REVIEW.
        logMessage.getInstance().logMessage(`Status not newly set to ${WORKORDER_STATUS}, or not set to ${WORKORDER_STATUS}. exit.`);
        return;
    }
    if (!newDocument.getReadyRequest()) {
        //Ready Request is null
        logMessage.getInstance().logMessage("Ready Request is null, exit.");
        return;
    }
    //loop through Phases to check Inspection Type and get first valid phase.
    const aePPhsEDTOList = newDocument.getAePPhsEDTOList();
    let firstValidPhase;

    for (let i = 0; i < aePPhsEDTOList.size(); i++) {
        let hasInspection = false;
        const aePPhsEDTO = aePPhsEDTOList.get(i);
        const proposal = aePPhsEDTO.getProposal();
        const sortCode = aePPhsEDTO.getSortCode();
        const queryAeAmInspectionEDTO = new AeAmInspectionEDTO();
        queryAeAmInspectionEDTO.setProposal(proposal);
        queryAeAmInspectionEDTO.setSortCode(sortCode);
        const aeAmInspectionEDTOList = GLOBAL_AssetFacade.findByDTO(queryAeAmInspectionEDTO, null);
        for (let j = 0; j < aeAmInspectionEDTOList.size(); j++) {
            hasInspection = true;
            const aeAmInspectionEDTO = aeAmInspectionEDTOList.get(j);
            if (aeAmInspectionEDTO.getInspectionType() == INSPECTION_TYPE) {
                logMessage.getInstance().logMessage(`WO already has inspection of type [${INSPECTION_TYPE}], exit.`);
                return;
            }
        }

        //check if phase is closed.
        const statusCode = aePPhsEDTO.getStatusCode();
        const category = aePPhsEDTO.getCategory();
        const orderType = aePPhsEDTO.getOrderType();
        const aePPstCDTO = GLOBAL_StatusFacade.find(new AePPstCPK(statusCode, category, orderType));
        if (aePPstCDTO.getCompleteYn() != 'N') {
            //Phase is not considered Open.
            logMessage.getInstance().logMessage("Phase is not considered Open. skip");
            continue;
        }

        if (!firstValidPhase && !hasInspection) {
            firstValidPhase = aePPhsEDTO;
        }
    }
    //Create Inspection.
    createInspection(firstValidPhase, newDocument.getReadyRequest(), newDocument.getEditDate());
}

/**
 * Create Inspection based on WO and Phase.
 * @param {AePPhsEDto} aePPhsEDto
 * @param {long} readyRequest
 * @param {String} editDate
 */
function createInspection(aePPhsEDto, readyRequest, editDate) {
    let aeAmInspectionEDTO = GLOBAL_AssetFacade.templateAeAmInspectionE();
    aeAmInspectionEDTO.setInspectionType(INSPECTION_TYPE);
    const aeAmTypeDTO = GLOBAL_AssetFacade.findByPrimaryKey(new AeAmInspectionTypeEPK(INSPECTION_TYPE), true);
    aeAmInspectionEDTO = GLOBAL_AssetFacade.inspectionDefaultsByType(aeAmInspectionEDTO, aeAmTypeDTO);
    aeAmInspectionEDTO.setRegionCode(aePPhsEDto.getRegionCode());
    aeAmInspectionEDTO.setFacId(aePPhsEDto.getFacId());
    aeAmInspectionEDTO.setBldg(aePPhsEDto.getBldg());
    aeAmInspectionEDTO.setDescription(`TAMU Inspection on Work Order [${aePPhsEDto.getProposal()}] and ReADY request number [${readyRequest}]`);
    aeAmInspectionEDTO.setProposal(aePPhsEDto.getProposal());
    aeAmInspectionEDTO.setSortCode(aePPhsEDto.getSortCode());
    aeAmInspectionEDTO.setAssetTag(aePPhsEDto.getAssetTag());
    aeAmInspectionEDTO.setStatusCode(INSPECTION_STATUS);
    aeAmInspectionEDTO.setScheduleDate(editDate);
    try {
        GLOBAL_AssetFacade.save(aeAmInspectionEDTO, true);
        logMessage.getInstance().logMessage(`Inspection[${aeAmInspectionEDTO.getInspectionNo()}] Created.`);
    } catch (e) {
        logMessage.getInstance().logErrorMessage("Error saving New Inspection, error: " + e);
    }
}

/**
 * If require() is not available, attempt to load it from jvm-npm_1.0.js
 * @throws TypeError: Cannot load script from jvm-npm_1.0.js
 */
function bootStrapRequire() {
    if (typeof require != "function" && typeof load == "function") {
        load(MODULE_PATH + "jvm-npm_1.0.js");
    }
}