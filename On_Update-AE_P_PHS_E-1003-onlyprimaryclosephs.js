// @author Steve Herring 
// @Date 11 FEB 2013
// @Version 1.0
// newDocument instanceof com.maximus.fmax.workmgt.dto.AePPhsEDTO
// This prevents users other than the primary shop person oran exempt list from changing phase status to complete statuses

eventLogMessage("1003 - ABP PHASE CLOSER - Start");

importPackage(com.maximus.fmax.common.framework.util.impl);
importPackage(com.maximus.fmax.common.framework.view.util);
importPackage(com.maximus.fmax.common.framework.service.impl);
importPackage(com.maximus.fmax.common.framework.util);
importPackage(com.maximus.fmax.purchasing.util);
importPackage(com.maximus.fmax.common.framework.util);
importPackage(com.maximus.fmax.common.framework);
importPackage(com.maximus.fmax.common.framework.Facade);
importPackage(com.maximus.fmax.common.security);
importPackage(com.maximus.fmax.common.security.dto);
importPackage(java.lang);
importPackage(java.util);
importPackage(com.maximus.fmax.common.framework.dao);
importPackage(com.maximus.fmax.workmgt.util);

var systemContext = SystemContext.getInstance();
var login = newDocument.getEditClerk();
var security = new SecurityFacade(SystemContext.getInstance());
if (newDocument.getStatusCode() == "COMPLETE"||newDocument.getStatusCode() == "CANCELED"||newDocument.getStatusCode() == "CLOSED"||
    newDocument.getStatusCode() == "PHS COMPLETE"||newDocument.getStatusCode() == "REOPEN") // if it is going to a closed status
{
  if (!security.hasRole(login,'PHASECLOSER')) //if they dont have the right role to bypass primary
    {
	  var shppersondetails =  newDocument.getAePProSDTOList();
	  var i=0;
	  var primary = 0;
      for (i=0;i<shppersondetails.size();i++)
      {				
        var shopperson = shppersondetails.get(i);
        if (shopperson.getShopPerson()+''== login+'' && shopperson.getPrimaryYn() == "Y")
	      {primary = 1;}
      }
	  if (primary == 0)   //check if they are primary
      { // if you get here closed status, not primary adn not in the bypass group need to fail with error message letting them know they are nto the primary.
	    var emptyObjectArray = java.lang.reflect.Array.newInstance(java.lang.Object, 2);  //have to use the fully qualified name on Array since it conflicts with some other Array
        emptyObjectArray[0] = "Not the primary for this phase";  
        emptyObjectArray[1] = "Primary shop person should close this phase";
        var errorMessage = new ErrorMessage(AePProEAttributeName.BUDGET, ErrorCode.SCRIPT_ERROR, emptyObjectArray);
        newDocument.addError(errorMessage); 
        false  //This false causes the Script Runner to throw an exception that will show up as a Error Message on the Screen
      }
	}
}

eventLogMessage("1003 - ABP PHASE CLOSER - End");

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