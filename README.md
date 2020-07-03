# 🥇 Golden Medal on StackOverflow

Want to look like a _pro_ on StackOverflow but you are too stupid to answer any difficult question so as to get enough upvotes?

Wanna do things the fun way? _Hacking_ your way in?

You came into the right place

## ⏮️ Prerequisits
Set `Fanatic` golden medal _(Visit the site each day for 100 consecutive days)_ as your **next badge** on your StackOverflow account.

## 💫 ENV variables needed to run
| Name              | Meaning     |
| :------------------:| :-----------|
| USERNAME          | StackOverflow username|
| PASSWORD          | StackOverflow password|
| PHONE             | Phone number that has Whatsapp messenger. This number will receive a daily notification tracking the advancement of the medal|
| SO_USER           | StackOverflow profile link ex: `https://stackoverflow.com/users/3546086/happyhands31` should have value `/3546086/happyhands31` |
| WA_LOCAL_STORAGE  | Stringified version of local storage from `https://web.whatsapp.com` once you logged in through the QR|
| COOKIES           | Stringified version of cookies on StackOverflow and Whatsapp Web |
| USER_AGENT        | The user agent you'd like to use. I suggest you open your preferred browser and type on the console `navigator.userAgent`. This way will be even sneaker to detect|

## ✨ What this runs
Project runs a web server with one endpoint: `/run`

This endpoint will access your StackOverflow account, and then send your progress through WhatsApp
