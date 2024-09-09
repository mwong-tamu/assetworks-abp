//newDocument instanceof com.maximus.fmax.workmgt.dto.AeIPreEDTO

//Update Material Request description with shop and placed by with userid

eventLogMessage("1011 - ABP MATERIAL REQUEST ACTION CODE - Start");

var eventImportedPackages = JavaImporter(
  com.maximus.fmax.common.errlog,
  com.maximus.fmax.common.framework.util.impl,
  com.maximus.fmax.workmgt.dto,
  com.maximus.fmax.workmgt);
  
  with (eventImportedPackages) 
  {
  	var context = SystemContext.getInstance();
	var facadeSH = new WorkMgtFacade(context);
    var trans_no  = newDocument.getPrCode();
	var entClerk = newDocument.getEntryClerk();

	
	//This Section Currently Pulls The Employee's Shop (Stord In Theuserid Field) And Adds 
	//It To The Beginning Of The Description.
	//INSTEAD, IT NEEDS TO PULL THE SHOP OF THE PHASE THE PURCHASE REQUEST IS BEING CREATED ON.
    
		  
	  
	  
	{  // get the Shop from the PHS record
      var SHSELECT = new AePPhsEDTO;
	  SHSELECT.setProposal(newDocument.getProposal());
	  SHSELECT.setSortCode(newDocument.getSortCode());
	  
      var ShList = facadeSH.findByDTO(SHSELECT, null);
	 var shRec = ShList.get(0);
	 var shShop = shRec.getShop();
	 
	  if(shShop)
	  {
	    if(newDocument.getDescription())
	    {
          newDocument.setDescription(shShop +' '+ newDocument.getDescription());
	    }
	    else
	    {
	     newDocument.setDescription(shShop);
	    }
	  }
	  
	    if(!newDocument.getPlacedby()) //placed by is null or empty
	  {
	    newDocument.setPlacedby(entClerk);
	  }
	}
}
	

function sendEmail(fromValue, emailAddress, subjectValue, msgValue)
{
	var emailTestImportedPackages = JavaImporter(com.maximus.fmax.common.framework.util.impl,
	com.maximus.fmax.common.framework.view.util,
	com.maximus.fmax.common.framework.service.impl,
	com.maximus.fmax.common.framework.util,
	com.maximus.fmax.common.messaging,
	com.maximus.fmax.common.framework,
	java.lang,
	com.maximus.fmax.workmgt.util,
	com.maximus.fmax.common.framework.view.webapp);
	with (emailTestImportedPackages) 
	{		
		if (emailAddress != null) 
		{
		  var context = SystemContext.getInstance();  		  
		  var logger = null;		    
		  var emailThread = EmailScreenThread(emailAddress, fromValue, subjectValue, msgValue, context, logger);
		}
	}

}

eventLogMessage("1011 - ABP MATERIAL REQUEST ACTION CODE - End");

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