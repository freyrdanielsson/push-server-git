const express = require('express');
const webpush = require('web-push');
var crypto = require('crypto');


const cors = require('./cors');

const {
    PORT: port = 5000,
    HOST: host = '127.0.0.1',
} = {}

// Take from env irl
const vapidKeys = {
    publicKey: 'BIEFQJ0uWcoNDGFm65HFEKjTsSgGgwaaGi-Hz4jASPLF4wY0Py8fn_gwJChrKsBXyS7WNC-INuNhvEB3456_gnY',
    privateKey: '_U9F8BfDH0DfFBv2MJ_qDu0Z1ye4wjGCH2oJhj9yBJ4'
};

webpush.setVapidDetails('mailto:freyrdanielsson@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);


const app = express();
app.use(express.json());

// So my app can send request
app.use(cors);

function createHash(input) {
    const md5sum = crypto.createHash('md5');
    md5sum.update(Buffer.from(input));
    return md5sum.digest('hex');
}

// TODO: Store persistently
const subscriptions = {};
function handlePushNotificationSubscription(req, res) {
    const subscriptionRequest = req.body;
    const susbscriptionId = createHash(JSON.stringify(subscriptionRequest));
    subscriptions[susbscriptionId] = subscriptionRequest;
    console.log(susbscriptionId, subscriptionRequest);
    
    res.status(201).json({ id: susbscriptionId, status: 'OK'});
}

let i = 0;
function sendPushNotification(req, res) {
    i++;
    const subscriptionId = req.params.id;
    const pushSubscription = subscriptions[subscriptionId];
    
    webpush
      .sendNotification(
        pushSubscription,
        JSON.stringify({
          title: 'Woho github activity!',
          text: 'Take a look at the new event',
          image: '',
          tag: i,
          url: 'https://github.com'
        })
      )
      .catch(err => {
        console.log(err);
      });
  
    res.status(202).json({});
  }


app.post('/', handlePushNotificationSubscription);
app.get('/:id', sendPushNotification);

app.listen(port, () => {
    if (host) {
        console.info(`Server running at http://${host}:${port}/`);
    }
});