/*
 * @Author Wes Duffard
 * @Title SET FUNDING METHOD TO 'Work Order' ON MAINTENANCE WORK ORDER PHASES
 * @Date 08/06/2017
 * @Version 1.0
 * Install as insert on Ae_P_Phs_E
 * Implemented due to the addition of multiple phases to the Maintenance processes.
 * Replaced AssetWorks developed action code, WORK ORDER (CR APPROVAL) CUSTOM ACCOUNT ACTION CODE - PHASE INSERT.
 * When phase is inserted on new or existing Work Order, if the Work Order is being created from a CR, 
 * it sets the distribution default to 'W' (Work Order) when type is 'M' (Maintenance), Category is SR or CM, 
 * and shop is not one of the exclude shops below. Otherwise, the script takes no action.
 */
 
eventLogMessage("1023 - ABP SET PHASE TO FUNDING METHOD OF WORK ORDER - Start");

// Note: var newDocument is instance of AePPhsEDTO
var ORDER_TYPE = 'M';
var CATEGORY1 = 'CM';
var CATEGORY2 = 'SR';
var EXCLUDESHOP1 = 'GROUNDS';
var EXCLUDESHOP2 = 'CUSTODIAL';
var EXCLUDESHOP3 = 'STRUCTURAL PEST';

var DEBUG = false;

var ImportedPackages = JavaImporter(
		com.maximus.fmax.common.framework.util.impl,
		com.maximus.fmax.workmgt.dto,
		com.maximus.fmax.workmgt,
		java.math
		);

with (ImportedPackages) {
	if (newDocument.getOrderType() == ORDER_TYPE && (newDocument.getCategory() == CATEGORY1 || newDocument.getCategory() == CATEGORY2) 
		&& (newDocument.getShop() != EXCLUDESHOP1 && newDocument.getShop() != EXCLUDESHOP2 && newDocument.getShop() != EXCLUDESHOP3)) {

		var context = SystemContext.getInstance();
		var workMgtFacade = new WorkMgtFacade(context);

		var aePPhsEDTO = workMgtFacade.findByPrimaryKey(new AePPhsEPK(newDocument.getProposal(),newDocument.getSortCode()),true);
		var aePProEDTO = workMgtFacade.findByPrimaryKey(new AePProEPK(aePPhsEDTO.getProposal()),false); 

        // If created from a CR, set the phase's funding method to 'Work Order'
        if (aePProEDTO.getDocNo() !== null && aePProEDTO.getDocNo() !== '' && aePPhsEDTO.getDefaultDist() != 'W' && aePPhsEDTO.getDefaultDist() != 'C') {
		    aePPhsEDTO.setDefaultDist('W');
		    workMgtFacade.save(aePPhsEDTO,false);
		}
	}
}

function logMessage(message){
	if (DEBUG) {
		var logMessageImportedPackages = JavaImporter(java.util.logging.Logger,
			java.util.logging.Level);
		with (logMessageImportedPackages) {
			try{
			var logger = Logger.getLogger("ACTION_CODE_SCRIPT");
			logger.log(Level.SEVERE, message, message);
			} catch(e){
				errorMessage(e.getMessage());
			}
		}
	}
}

eventLogMessage("1023 - ABP SET PHASE TO FUNDING METHOD OF WORK ORDER - End");

function eventLogMessage(message)
{
    var eventLogMessageImportedPackages = JavaImporter(
        com.maximus.fmax.common.errlog,
        com.maximus.fmax.common.framework.util.impl
        );

    with (eventLogMessageImportedPackages)
    {
        try
        {
        var context = SystemContext.getInstance();
        var facade = new ErrLogFacade(context);
        var aeEventLogDTO =  facade.templateAeEventLog();
        aeEventLogDTO.setEventDate(new java.sql.Timestamp(new java.util.Date().getTime()));
        aeEventLogDTO.setLogin(context.getLogin());
        aeEventLogDTO.setEventType('ACTION CODE');
        aeEventLogDTO.setResourceKey('');
        aeEventLogDTO.setDescription(message);
        aeEventLogDTO.setLongDesc(message);
        facade.save(aeEventLogDTO, true);
        } catch(e)
        {
            errorMessage(e.getMessage());
        }
    }
}