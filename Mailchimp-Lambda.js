const mailchimp = require('@mailchimp/mailchimp_marketing');

// Set your Mailchimp API key and audience ID

// 'apikey' is the key token you got from your Mailchimp account. It's assigned as an environment variable in the lambda function with the 'API_KEY' name
const apiKey = process.env.API_KEY;

// 'audienceId' is the code name of your audience, assigned as the 'AUD_ID' environment variable.
const audienceId = process.env.AUD_ID;

// Initialize the Mailchimp client
Mailchimp.setConfig({
  apiKey: apiKey,

// Change this based on your location, you can know it from the Mailchimp URL's subdomain shown in your browser.
  server: 'us21', // e.g., 'us1', 'us2', etc.
});

var response = {
  "isBase64Encoded": false,
  "headers": { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '' },
  "statusCode": 200,
  "body": "{\"result\": \"Success.\"}"
};

//This is the lambda function that runs the event, which includes the addContactAudience function that we created below.
exports.handler = async function (event, context) {
  console.log('Received event:', event);
  try {
    await addContactToAudience(event);
    context.succeed(response);
  } catch (err) {
    console.error('Error:', err);
    response.statusCode = 500;
    response.body = JSON.stringify({ "result": "Error occurred." });
    context.fail(response);
  }
};

// Here is the Mailchimp function:
async function addContactToAudience(event) {
  try {
    const response = await mailchimp.lists.addListMember(audienceId, {

      // even.email & event.name are variables defined in the Javascript code that gets the HTML form's data
      email_address: event.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: event.name,
      },
    });

    console.log('Contact added successfully:', response);
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}
