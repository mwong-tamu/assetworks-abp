// Default the PERCENTAGE on account setup for phase (Before Insert)

// newDocument is an instance of AePPhsCDTO
// AE_P_PHS_C, TYPE=TEMPLATE

eventLogMessage("1049 - ABP set default account percentage - Start");

var importedPackages = JavaImporter(com.maximus.fmax.workmgt.dto,
									java.math);
									
									
with (importedPackages){
	percent = new BigDecimal("100");
	newDocument.setSubPercent(percent)
	newDocument.setSubCode('5530');
}

eventLogMessage("1049 - ABP set default account percentage - End");

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