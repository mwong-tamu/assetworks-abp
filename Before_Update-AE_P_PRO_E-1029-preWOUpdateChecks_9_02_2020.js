/*
 * @Author Wes Duffard
 * @Title Pre-Update WO record edit checks
 * @Date 08/19/2020
 * @Version 1.0
 * Install as update on AE_P_PRO_E sequence = 1
 * File: preWOUpdateChecks.js
 * Purpose:
 *   This action code performs the following pre-update edit checks when the user attempts to save.
 *   1. Prevents the user setting the work order status to "WO COMPLETE" or "WO REVIEWED" if the Billable Status is null.
 *      If not set when the CR is issued, the WO Billable Status defaults to NULL when the work order is created.
 *      The purpose of this action code is to force the user to consider whether a work order is billable or not.
 *      It prevents the user setting the work order status to "WO COMPLETE" or "WO REVIEWED", until a
 *      Billable Status has been selected.
 *      Note that the CUSTODIAL shop is ignored in this section of the code.
 *   2. Prevents the user from saving the WO if a phase is begin set to a status of PHS COMPLETE of CONTRACTOR COMPLETE
 *      if no asset has been assigned to the PHS.
 *      Note that the CUSTODIAL shop and all GROUNDS related shops are ignored in this section of the code.
 */
 
eventLogMessage("1029 - ABP Prevents the user setting the work order status to - Start");

importPackage(com.maximus.fmax.common.framework);
importPackage(com.maximus.fmax.common.framework.util);
importPackage(com.maximus.fmax.common.framework.util.impl);
importPackage(com.maximus.fmax.common.framework.view.util);
importPackage(com.maximus.fmax.common.framework.service.impl);
importPackage(com.maximus.fmax.workmgt.util);
importPackage(java.lang);

//the instance returned will be of the AeProEDTO object
var systemContext = SystemContext.getInstance();
var woStatus = newDocument.getStatusCode();
var billableStatus = newDocument.getWoPriCode();

//need to clear errors or the previous warning could still be there and the user will get stuck on the modal
newDocument.clearErrors();

//Edit check 1.  Do not test against the custodial shop
if (newDocument.getShop() != "CUSTODIAL") {
    if (newDocument.getStatusCode() == "WO COMPLETE" || newDocument.getStatusCode() == "FC REVIEW") {
        if (newDocument.getWoPriCode() == null) {
           var emptyObjectArray = java.lang.reflect.Array.newInstance(java.lang.Object, 2);
           emptyObjectArray[0] = "Billable Status Validation Error";
           emptyObjectArray[1] = "A Work Order status of " + woStatus + " requires a Billable Status.";
           var errorMessage = new ErrorMessage(AePProEAttributeName.WO_PRI_CODE, ErrorCode.SCRIPT_ERROR, ErrorType.HARD, emptyObjectArray);
           newDocument.addError(errorMessage);
           //This false causes the Script Runner to throw an exception that will show up as a Error Message on the Screen
           false
        }
    }
}



    var usedAssets = "";
    var badPhases = "";
    var phaseList = newDocument.getAePPhsEDTOList();
    //for testing
    //phaseListOld = oldDocument.getAePPhsEDTOList();
    //eventLogMessage("newPhaseList = " + phaseList.toString());
    //eventLogMessage("oldPhaseList = " + phaseListOld.toString());

    for (var j = 0; j < phaseList.size(); j++) {
        var phase = phaseList.get(j);
        //create a list of any asset tags used on phases
        if (phase.getAssetTag() != null && phase.getAssetTag() != '') {
            usedAssets = usedAssets + phase.getAssetTag() + " "; 
        }


        if (phase.getShop() == "CUSTODIAL" || phase.getShop() == "GAM - GROUNDS" || phase.getShop() == "GBL - GROUNDS" || phase.getShop() == "GR-ADMIN"
    || phase.getShop() == "GREENHOUSES" || phase.getShop() == "GROUNDS" || phase.getShop() == "GROUNDS SPECIAL PROJECTS" || phase.getShop() == "HEQ"
    || phase.getShop() == "HORT" || phase.getShop() == "IRRIGATION" || phase.getShop() == "L&O" || phase.getShop() == "LCON" || phase.getShop() == "MECHANICS"
    || phase.getShop() == "REC SPORTS - GROUNDS" || phase.getShop() == "RELLIS - GROUNDS" || phase.getShop() == "SANITATION" || phase.getShop() == "STRUCTURAL PEST"
    || phase.getShop() == "TREE" || phase.getShop() == "TURF") {

        }
            //create a list of phases that cannot be saved because no asset tag assigned        
            else if ((phase.getStatusCode() == "PHS COMPLETE" || phase.getStatusCode() == "CONTRACTOR COMPLETE") && (phase.getAssetTag() == null || phase.getAssetTag() == '')) {
                badPhases = badPhases + "'" + phase.getSortCode() + "' ";
            }
    }


    if (usedAssets != "") {
        usedAssets = "The following assets have been used on this work order: " + usedAssets + ".";
    }
    if (badPhases != "") {
        badPhases = "The following Phases require Asset assignments before they can be completed: " + badPhases + ". ";
    }
    
    if (badPhases != "") {
        // HARD stops, SOFT gives option to continue, RESPONSE ??????
        //200819-758460
        
        //        ErrorCode.SCRIPT_ERROR        | emptyObjectArray[0]   | emptyObjectArray[1]
        //Error Code: 1091 Error running script [Asset Validation Error]: Phase 001 status of PHS COMPLETE requires an asset assignment.
        var emptyObjectArray = java.lang.reflect.Array.newInstance(java.lang.Object, 2);
        emptyObjectArray[0] = "Asset Validation Error";
        emptyObjectArray[1] = badPhases + usedAssets;
        var errorMessage = new ErrorMessage(AePPhsEAttributeName.ASSET_TAG, ErrorCode.SCRIPT_ERROR, ErrorType.HARD, emptyObjectArray);
        newDocument.addError(errorMessage);
        //This false causes the Script Runner to throw an exception that will show up as a Error Message on the Screen
        false
    }


/* For Debugging.  Writes to the ae_event_log table.
//eventLogMessage("newDoc = " + newDocument.toString());
//eventLogMessage("oldDoc = " + oldDocument.toString());
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
        aeEventLogDTO.setResourceKey('Update AE_P_PRO_E');
        aeEventLogDTO.setDescription(message);
        aeEventLogDTO.setLongDesc(message);
        facade.save(aeEventLogDTO, true);
        } catch(e)
        {
            errorMessage(e.getMessage());
        }
    }
}
*/

eventLogMessage("1029 - ABP Prevents the user setting the work order status to - End");

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