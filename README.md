# S3-StaticSite-with-MailChimp
## Connect Mailchimp API with S3 Static Site using Lambda

In this article, you'll learn how to deploy a static site on AWS S3 and connect it with Mailchimp API so you can register Clients' emails to your email list. This is suitable for those who offer an email newsletter and would like to design their own email form's landing page. Or want to connect a contact form on their website to an email list.

### Requirements 

1. Static Site with a Form deployed on AWS S3.
2. Mailchimp account, Audience, and API token.
3. API Gateway to connect the S3 static site to Lambda.
4. Lambda function to collect the data from the website's form and register it to Mailchimp.

### Preparation

#### Step #1:
Create an HTML file having a contact form including the user's name and email address. If you don't have one, refer to the following [documentation](https://github.com/obreo/Send-Online-Forms-through-AWS-SES) for a ready-to-use one. The html should be linked to a javascript that will get the POST data inserted and push them through an API that we will add later.

#### Step #2:
Create an AWS S3 Bucket, and upload the HTML file with the Scripts folder. Enable the Static-Site option from properties and locate the /index.html

#### Step #3:
1. Create a Mailchimp account, then from the sidebar, go to **audience**, this is where you can create a contact list, create a new audience and name it as you like. Now from the top bar at the right corner, click on **settings** then choose **Audience name and defaults**, You will find a code assigned for your audience's contact list, note it because you will need it when you call Mailchimp API.

2. Go to Account Settings > Extras > API Keys. Then generate a new API Token, which will be used to call the Mailchimp API.

#### Step #4:
From the AWS console, search for the API Gateway service - used to create APIs to be used for the applications connected with AWS services - and create a new REST API then assign it with POST Method - the standard safe method to submit data to a specific source. Once you get it, copy the URL and add it to the Javascript code connected to the HTML index file.

#### Step #5:

1. Create a Lambda function in AWS with a NodeJS runtime.
2. From the left sidebar in Lambda, we need to assign a Layer; which is used to add libraries to the code, which is Mailchimp in our case. To do so, refer to the AWS [Documentation](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html). Then install the Mailchimp dependencies using:
```
// nodejs.zip:
npm install @mailchimp/mailchimp_marketing
npm install superagent
```
3. Go to the function and assign the API Gateway you created to the **trigger** tab. then add the following code:
```
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

```
From the configuration tab in Lambda, set the Environment variables with your API Token of Mailchimp and the Audience ID. 

### Testing
Deploy the code in Lambda, test through your static site page, and check the audience in MailChimp.
