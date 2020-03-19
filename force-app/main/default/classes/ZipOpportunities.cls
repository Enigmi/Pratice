public with sharing class ZipOpportunities {

	public String accountId {get; set;}
	public String zipFileName {get; set;}

	/**
	*	Query for the Account using the parameter in the query string
	*	Set the filename for the ZIP file
	**/
	public ZipOpportunities() {
		this.accountId = ApexPages.currentPage().getParameters().get('id');
		Account a = [SELECT Name FROM Account WHERE Id = :accountId];

		// Set the zip's filename to be formatted like "AccountName-2016-3-10.zip"
		this.zipFileName = a.Name + '-';
		Date d = Date.today();
		this.zipFileName += d.year() + '-' + d.month() + '-' + d.day() + '.zip';
	}

	/**
	*	Used for manually throwing errors back to the Visualforce page
	*	Usage: throw new ApplicationException('This is the error message');
	**/
	public class ApplicationException extends Exception {}

	/**
	*	Primary function that initiates XML document creation.
	*	Data is grouped by Opportunity into individual XML documents,
	*	and within each file the Opportunity's data is displayed.
	**/
	@RemoteAction
	public static Map<String, String> getXMLFiles(String accountId) {
		// Get the Account and fields using the passed variable
		Account a = [SELECT Id, Name FROM Account WHERE Id = :accountId];

		// Query for all Opportunities on the Account
		List<Opportunity> opps = [SELECT Id, Name, StageName, Amount FROM Opportunity WHERE AccountId = :a.Id];

		if(opps.size() == 0) {
			throw new ApplicationException('The selected Account does not have any Opportunities. Please add an Opportunity to the Account and try again.');
		}

		// Setup map to contain all results from this method. Will contain the generated XML files and a list of Opportunities that were used in the process.
		Map<String, String> resultsData = new Map<String, String>();

		// Create the XML body and filename for each Opportunity
		for(Opportunity opp : opps) {
			String body = '<?xml version="1.0"?>\n' +
				'<account id="' + a.Id + '">\n' +
				'<opportunity id="' + opp.Id + '">\n' +
				'<name>' + opp.Name + '</name>\n' +
				'<stage>' + opp.StageName + '</stage>\n' +
				'<amount>' + opp.Amount + '</amount>\n' +
				'</opportunity>\n' +
				'</account>';

			String filename = opp.Name + '-';
			Date d = Date.today();
			filename += d.year() + '-' + d.month() + '-' + d.day() + '.xml';

			// Save the XML filename and body to the resultsData map
			//	The body is converted to a blob and Base64 encoded to create a virtual 'file' in memory
			resultsData.put(filename, EncodingUtil.base64Encode(Blob.valueOf(body)));
		}

		return resultsData;
	}

	/**
	*	Remote Action method to save the ZIP file as an attachment
	*	Set the ParentId to connect it to a specific record (the Account in this case)
	**/
	@RemoteAction
	public static String saveData(String recordId, String filename, String data) {
		try {
			Attachment att = new Attachment(
				Name = filename,
				Body = EncodingUtil.base64Decode(data),
				ParentId = recordId
			);

			insert att;

			return 'SUCCESS';
		} catch(Exception e) {
			return e.getMessage();
		}
	}
}