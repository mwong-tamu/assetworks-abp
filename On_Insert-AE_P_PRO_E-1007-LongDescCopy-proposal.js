// @author Steve Herring 
// @Date 8 May 2013
// @Version 1.0
// newDocument instanceof com.maximus.fmax.workmgt.dto.AePProEDTO
// Copy the work order Long description to the 001 phase long description
importPackage(com.maximus.fmax.common.framework.util.impl);
importPackage(com.maximus.fmax.common.framework.view.util);
importPackage(com.maximus.fmax.common.framework.service.impl);
importPackage(com.maximus.fmax.common.framework.util);
importPackage(com.maximus.fmax.common.framework);
importPackage(com.maximus.fmax.common.framework.Facade);
importPackage(com.maximus.fmax.common.security);
importPackage(com.maximus.fmax.common.security.dto);
importPackage(java.lang);
importPackage(java.util);
importPackage(com.maximus.fmax.common.framework.dao);
importPackage(com.maximus.fmax.workmgt.util);
importPackage(com.maximus.fmax.workmgt.dto);
importPackage(com.maximus.fmax.workmgt);
importPackage(com.maximus.fmax.workmgt.service.impl);

eventLogMessage("1007 - ABP Copy work order long description to the 001 phase - Start");

var systemContext = SystemContext.getInstance();
var phs = new AePPhsEDTO;
	var phslist = newDocument.getAePPhsEDTOList();
	phs= phslist.get(0);
	phs.setLongDesc(newDocument.getLongDesc());
	
eventLogMessage("1007 - ABP Copy work order long description to the 001 phase - End");

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