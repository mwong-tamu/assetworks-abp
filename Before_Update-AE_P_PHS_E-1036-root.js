/*
 * @Author Wes Duffard - Modified by Cade
 * @Title Prevents the user setting the phase status to "PHS Complete" if the assest tag is null.
 * @Date 04/11/2019
 * @Version 1.0
 * Install as update on AE_P_PHS_E sequence = 1
 * File: requireAsset.js
 * docId D4822507-7BF4-4C4F-8246-CF31F0034E8A
 * Note that the CUSTODIAL shop is ignored in the code.
 */

importPackage(com.maximus.fmax.common.framework);
importPackage(com.maximus.fmax.common.framework.util);
importPackage(com.maximus.fmax.common.framework.util.impl);
importPackage(com.maximus.fmax.common.framework.view.util);
importPackage(com.maximus.fmax.common.framework.service.impl);
importPackage(com.maximus.fmax.workmgt.util);
importPackage(java.lang);

eventLogMessage("1036 - ABP Asset Tag Phase Complete - Start");

//the instance returned will be of the AeProEDTO object
var systemContext = SystemContext.getInstance();
var woStatus = newDocument.getStatusCode();
var AssetStatus = newDocument.getAssetTag();

//need to clear errors or the previous warning could still be there and the user will get stuck on the modal
newDocument.clearErrors();

if (newDocument.getShop() == "CUSTODIAL" || newDocument.getShop() == "GAM - GROUNDS" || newDocument.getShop() == "GBL - GROUNDS" || newDocument.getShop() == "GR-ADMIN" || newDocument.getShop() == "GREENHOUSES" || newDocument.getShop() == "GROUNDS" || newDocument.getShop() == "GROUNDS SPECIAL PROJECTS" || newDocument.getShop() == "HEQ" || newDocument.getShop() == "HORT" || newDocument.getShop() == "IRRIGATION" || newDocument.getShop() == "L&O" || newDocument.getShop() == "LCON" || newDocument.getShop() == "MECHANICS" || newDocument.getShop() == "REC SPORTS - GROUNDS" || newDocument.getShop() == "RELLIS - GROUNDS" || newDocument.getShop() == "SANITATION" || newDocument.getShop() == "STRUCTURAL PEST" || newDocument.getShop() == "TREE" || newDocument.getShop() == "TURF" || newDocument.getShop() == "TURF" || newDocument.getShop() == "B-CUSTODIAL" || newDocument.getShop() == "B-FACILITIES" || newDocument.getShop() == "B-SAFETY" || newDocument.getShop() == "B-SECURITY" || newDocument.getShop() == "D-CUSTODIAL" || newDocument.getShop() == "D-FACILITIES" || newDocument.getShop() == "D-SAFETY" || newDocument.getShop() == "D-SECURITY" || newDocument.getShop() == "H-CUSTODIAL" || newDocument.getShop() == "H-FACILITIES" || newDocument.getShop() == "H-SAFETY" || newDocument.getShop() == "H-SECURITY" || newDocument.getShop() == "K-CUSTODIAL" || newDocument.getShop() == "K-FACILITIES" || newDocument.getShop() == "RR-CUSTODIAL" || newDocument.getShop() == "RR-FACILITIES" || newDocument.getShop() == "RR-SECURITY" || newDocument.getShop() == "T-FACILITIES" ) {
  //
}
else if (newDocument.getStatusCode() == "SSC COMPLETE" || newDocument.getStatusCode() == "CONTRACTOR COMPLETE") {
        if (newDocument.getAssetTag() == null || newDocument.getAssetTag() == '') {
           var emptyObjectArray = java.lang.reflect.Array.newInstance(java.lang.Object, 2);
           emptyObjectArray[0] = "Asset Validation Error";  
           emptyObjectArray[1] = "A Phase status of " + woStatus + " requires an asset assignment.";
           var errorMessage = new ErrorMessage(AePPhsEAttributeName.ASSET_TAG, ErrorCode.SCRIPT_ERROR, ErrorType.HARD, emptyObjectArray);
           newDocument.addError(errorMessage);       
           //This false causes the Script Runner to throw an exception that will show up as a Error Message on the Screen
           false
        }
    }

eventLogMessage("1036 - ABP Asset Tag Phase Complete - End");

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