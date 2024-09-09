// @author Randy Walsh
// @Date 27 AUG 2014
// @Version 1.0
// newDocument instanceof com.maximus.fmax.workmgt.dto.AePProEDTO
// This script will update the description of the Work Order with the propery description on insert
// Action code Screen Setup:
// Table Name: AE_P_PRO_E
// Type: Insert
/*
 * 08/03/2018 Wes Duffard - Per Paul Tisch, updated the default budget from 4500.00 to 5000.00.
 * 08/03/2021 Wes Duffard - Per Paul Tisch, updated the default budget from 5000.00 to 5220.00.
 * 07/31/2024 Micky Wong - Per Charles Darby and approval of the AssetWorks Steering Committee, updated the default budget from 5220.00 to 6000.00; also added logging information to the event table
 */

var proposal = newDocument.getProposal();

var eventImportedPackages = JavaImporter(
com.maximus.fmax.common.framework.util.impl,
com.maximus.fmax.workmgt.dto,
com.maximus.fmax.workmgt.util,
com.maximus.fmax.workmgt,
com.maximus.fmax.workmgt.service.impl,
java.math,
com.maximus.fmax.property.service.impl);

eventLogMessage("1016 - ABP Default Budget - " + proposal + " - Start");

with (eventImportedPackages) {
  var context = SystemContext.getInstance();
  var workMgtServiceImpl = new WorkMgtServiceImpl(context);
  var budget = new BigDecimal("6000.00");

  //Update the Work Order
  var aePProEDTO = workMgtServiceImpl.findByPrimaryKey(new AePProEPK(proposal),true);
  var mutable = (aePProEDTO.getAttribute(AePProEAttributeName.BUDGET).isMutable());
  if (!mutable) {
    aePProEDTO.getAttribute(AePProEAttributeName.BUDGET).setMutable(true);
  }
  aePProEDTO.setBudget(budget);
  if (!mutable) {
    aePProEDTO.getAttribute(AePProEAttributeName.BUDGET).setMutable(false);
  }
  workMgtServiceImpl.save(aePProEDTO,false,false);  //false is don't check validation
}

eventLogMessage("1016 - ABP Default Budget - " + proposal + " - End");

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