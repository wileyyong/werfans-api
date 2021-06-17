Install
---------

In order to run the project you need: 
* Node, 
* MongoDB, 
* Redis.

Install `yarn` with:

```
npm install -g yarn
```

Install dependencies, executing from the repo folder:

``` 
yarn install
```

And run the project, executing from the same place:
``` 
yarn start
```

### Dev mode

For development purposes it's more convenient to run the project with:
```
yarn dev
```
In this case the server will be restarted every time you update source code.

Configuration
--------

Env var | Default value
--------|---------------
*General* |
NODE_ENV | development
PORT | 1340,
*MongoDB* |
MONGO_URL | mongodb://localhost/lc-backend
MONGO_POOL_SIZE | 5
MONGO_CONNECT_TIMEOUT | 30000
MONGO_SOCKET_TIMEOUT | 30000
*Redis* |  
REDIS_URL | redis://127.0.0.1:6379  
*Mailing* |
MAILER_FROM | no-reply@example.com
MAILER_SERVICE_PROVIDER | ses
SES_REGION  | 'eu-west-1'
URL_RESET_PASSWORD  | resetPassword
URL_VERIFY_EMAIL  | verify
*S3* |  
S3_ACCESS_KEY_ID | -
S3_SECRET_ACCESS_KEY | -
S3_REGION | -
S3_BUCKET | -
S3_BUCKET_URL | -
*OAuth2* |  
CLIENT_NAME | default
CLIENT_ID | default
CLIENT_SECRET | default
*defaultUser* |
DEFAULT_ADMIN_USERNAME | admin@example.com
DEFAULT_ADMIN_PASSWORD | adminadmin
DEFAULT_FIRST_NAME | admin
DEFAULT_LAST_NAME | admin
*Logger* |  
LOGGER_SUPPRESS_STDOUT  |
LOGGER_LEVEL | debug
*Others* |
DEFAULT_CLIENT_ORIGIN  | lc-backend.werfans.com
*Billing* |
BILLING_ENDPOINT | https://api.ccbill.com/wap-frontflex/flexforms
BILLING_WEBHOOK_SECRET | webhookSecret
BILLING_FLEX_ID | d91601e7-ffaf-452c-b9b2-21ee77abc662
BILLING_CLIENT_ACCOUNT_NUM | 951492
BILLING_CLIENT_SUBACCOUNT | 0021
BILLING_SALT |
BILLING_TESTING_MODE / true


Code structure brief
---------
```
app
    controllers
        api     - controllers, not related to models by itself, just endpoints with custom actions
        rest    - restfull controllers, related to models 
    event-handlers  - kind of glue, allowing to achieve decoupling between different parts of the app 
    jobs - agenda (jobs scheduling engine) jobs
    lib
        consts  - different constants
        middleware  - express.maker.ts midlewares, allows to configure http server
        restdone.plugin   - plugins for restdone library
        services    - so, services. Singletones injected to `app` and available from there
    models  - Mongoose model for MongoDB
    views   - we have some for emails we're sending
config  - different configs
makers  - kind of top level services, that orchestrate the app behaviour 
migrations - db migrations
test    - everything related to tests (we use e2e tests here, every test is simulating an http client)
    data    - testing data comes from here 
    helper  - some utils
    spec    - BDD specs
```

REST conventions
--------

General URL schema:
`/[${filteringPath}/]${resourcePath}[/${id}][/${specificPath}]`

For example:
* `/users` - affects lists of the resources
* `/users/:id`  - affects a resource
* `/users/reset/:token`  - special action for a list
* `/users/:id/change-password` - special action for a resource
* `/chats/:chat/messages` - with filtering path

Basic CRUD:
* `GET / => 200` - getting a list
* `POST / => 201` - create a resource
* `GET /:id => 200` - getting a resource by id
* `PATCH /:id => 200` - update resource with new value provided
* `PUT /:id => 200` - replace resource with values provided
* `DELETE /:id => 204` - remove resource with values provided
* `GET /count => 200` - getting a count

Socket.io transport
--------

Additionally to http transport all REST endpoints are available through socket.io.
We have some conventions for "expressing" of REST language through socket.io. Let's show this by several examples.
Sending requests:
* Create message: 
```javascript
socket.emit('restdone', { 
  route: 'post:/chats/:chat/messages', 
  params: { chat: chat._id }, 
  body: message,
});
```
* Get message list:
```javascript
socket.emit('restdone', { 
  route: 'get:/chats/:chat/messages', 
  params: { chat: chat._id }, 
  filter: { createdAt: { $lt: '2020-01-10T14:47:23.608Z' } },
});
```

Getting responses:
```javascript
  socket.on('restdone', (payload) => {
    const response = payload.result;
    if (response.statusCode === 200) {
      resolve(response.body);
    } else {
      reject(new Error(`Something went wrong ${response.statusCode}`));
    }
  });
```

API requests
--------

> In the examples we use `httpie` and `jq` packages. 
> You can install them with `sudo apt-get install httpie jq`.

### Common vars
```
HOST=https://cadenza-lc1-api.herokuapp.com
CLIENT_ID=default
CLIENT_SECRET=default
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminadmin
```

### Docs

You can find swagger docs under ```/api-docs```. This feature can be switched on for different environments by adding ```serveSwaggerDocs: true``` param into appropriate env config file.
Default: ```true``` for ```development``` environment.

### User flow

```
USER_USERNAME=username
USER_EMAIL=email@example.com
USER_PASSWORD=my_password

## create user
USER=`http POST $HOST/users client_id=$CLIENT_ID client_secret=$CLIENT_SECRET username=$USER_USERNAME password=$USER_PASSWORD email=$USER_EMAIL` type=E
ACCESS_TOKEN=$(echo $USER | jq -r .auth.access_token)
REFRESH_TOKEN=$(echo $USER | jq -r .auth.refresh_token)

## get user
http $HOST/users/me Authorization:"Bearer $ACCESS_TOKEN"

## change password
NEW_USER_PASSWORD=newPassword
http $HOST/users/me/change-password password=$USER_PASSWORD newPassword=$NEW_USER_PASSWORD Authorization:"Bearer $ACCESS_TOKEN"
USER_PASSWORD=$NEW_USER_PASSWORD

## update user
http PATCH $HOST/users/me username=newUserName Authorization:"Bearer $ACCESS_TOKEN"

AUTH=`http --form POST $HOST/oauth grant_type=password client_id=$CLIENT_ID client_secret=$CLIENT_SECRET username=$USERNAME password=$PASSWORD`
ACCESS_TOKEN=$(echo $AUTH | jq -r .access_token)
REFRESH_TOKEN=$(echo $AUTH | jq -r .refresh_token)

# log in user with refresh token
AUTH=`http --form POST $HOST/oauth grant_type=refresh_token client_id=$CLIENT_ID client_secret=$CLIENT_SECRET refresh_token=$REFRESH_TOKEN`
ACCESS_TOKEN=$(echo $AUTH | jq -r .access_token)
REFRESH_TOKEN=$(echo $AUTH | jq -r .refresh_token)

## resend verification email
http PUT $HOST/users/resend-verification Authorization:"Bearer $ACCESS_TOKEN"

## verify email
EMAIL_TOKEN=token
http POST $HOST/users/verify-email/$EMAIL_TOKEN client_id=$CLIENT_ID client_secret=$CLIENT_SECRET

## delete user
http DELETE $HOST/users/me Authorization:"Bearer $ACCESS_TOKEN"
```

### Chat flow
> Draw your attention: In order to get connected to chat rooms you should use socket.io transport for opening chat.

```
USER_USERNAME=username
USER_EMAIL=email@example.com
USER_PASSWORD=my_password
OTHER_USER_USERNAME=otherusername
OTHER_USER_EMAIL=otheremail@example.com
OTHER_USER_PASSWORD=my_password

## create users
USER=`http POST $HOST/users client_id=$CLIENT_ID client_secret=$CLIENT_SECRET username=$USER_USERNAME password=$USER_PASSWORD email=$USER_EMAIL`
USER_ID=$(echo $USER | jq -r ._id)
ACCESS_TOKEN=$(echo $USER | jq -r .auth.access_token)
OTHER_USER=`http POST $HOST/users client_id=$CLIENT_ID client_secret=$CLIENT_SECRET username=$OTHER_USER_USERNAME password=$OTHER_USER_PASSWORD email=$OTHER_USER_EMAIL`
OTHER_USER_ID=$(echo $OTHER_USER | jq -r ._id)
OTHER_ACCESS_TOKEN=$(echo $OTHER_USER | jq -r .auth.access_token)

## open chat
CHAT=`http PUT $HOST/users/me/chats/$OTHER_USER_ID Authorization:"Bearer $ACCESS_TOKEN"`
CHAT_ID=$(echo $CHAT | jq -r ._id)

## send message
MESSAGE=`http POST $HOST/chats/$CHAT_ID/messages body="message body" Authorization:"Bearer $ACCESS_TOKEN"` 
MESSAGE_ID=$(echo $MESSAGE | jq -r ._id)

## update message
http PATCH $HOST/chats/$CHAT_ID/messages/$MESSAGE_ID body="updated message body" Authorization:"Bearer $ACCESS_TOKEN" 

## get message
http $HOST/chats/$CHAT_ID/messages/$MESSAGE_ID Authorization:"Bearer $ACCESS_TOKEN"

## get message by other user
http $HOST/chats/$CHAT_ID/messages/$MESSAGE_ID Authorization:"Bearer $OTHER_ACCESS_TOKEN" 

## get message list by other user
http $HOST/chats/$CHAT_ID/messages Authorization:"Bearer $OTHER_ACCESS_TOKEN" 

## make read by other user
http DELETE $HOST/chats/$CHAT_ID/messages/$MESSAGE_ID/unread Authorization:"Bearer $OTHER_ACCESS_TOKEN" 

## make all read by other user
http DELETE $HOST/chats/$CHAT_ID/messages/unread Authorization:"Bearer $OTHER_ACCESS_TOKEN" 

## delete message
http DELETE $HOST/chats/$CHAT_ID/messages/$MESSAGE_ID Authorization:"Bearer $ACCESS_TOKEN"

## delete chat
http DELETE $HOST/users/me/chats/$OTHER_USER_ID Authorization:"Bearer $ACCESS_TOKEN"

## delete users
http DELETE $HOST/users/me Authorization:"Bearer $ACCESS_TOKEN"
http DELETE $HOST/users/me Authorization:"Bearer $OTHER_ACCESS_TOKEN"
```

### Admin
```
# log in admin with password
ADMIN_ACCESS_TOKEN=`http --form POST $HOST/oauth grant_type=password client_id=$CLIENT_ID client_secret=$CLIENT_SECRET username=$ADMIN_USERNAME password=$ADMIN_PASSWORD | jq -r .access_token`
```

Socket.io rooms
--------

### Chat Room

* name: chat#${chatId}
* joining: after opening the chat 
* messages: 
  * chat#${chat._id}-new-message({ message: Message })
  * chat#${chat._id}-update-message({ message: Message })
  * chat#${chat._id}-read-message({ message: { _id: String } })
  * chat#${chat._id}--read-chat({})

### Notifications

#### Global

* name: global-notifications
* joining: after opening authenticated connection 
* messages: 
  * new-global-notification({ message: Message })

#### User

* name: user-notifications-#${userId}
* joining: after opening authenticated connection 
* messages: 
  * new-user-notification({ message: Message })
  * new-user-signal({ message: Message })
