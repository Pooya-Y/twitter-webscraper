# twitter-scraper.js
A Twitter web scraper built with TypeScript and Puppeteer 
## Installation
To use this package in your project, run:
```bash
npm i twitter-scraper.js
```
## Features
- Log in to your Twitter account
- Scrape tweets
- Scrape user's information
- Scrape user's followers
- Scrape user's following
## To Implement
- Search and Scrape top and latest tweets 
- Scrape logged in user's timeline
- Scrape user's tweets

## Usage

```js
const { Scraper } = require('twitter-scraper.js');
const scraper = new Scraper();

(async () => {
    // It will initialize the headless browser 
    await scraper.initializeBrowser();
    // It's not necessary to log in, but if you want to have access to all of the features, then you need to log in.  
    await scraper.login('username or email', 'password');
    const userInfo = await scraper.getUserInfo('username');
    console.log(userInfo);
    // It will close the headless browser. 
    // You have to write this at the end of your code. 
    scraper.browser.close();
})();
```

## Methods

Method | Description 
--- | --- 
`initializeBrowser()` | It will initialize the headless browser  
`login(username_or_email: string, password: string)` | Log in to your Twitter account  
`getUserInfo(username: string)` | Scrape information of the given user
`getFollwers(username: string)` | Scrape followers of the given user
`getFollwing(username: string)` | Scrape following of the given user 
`getTweet(link: string)` | Scrape the given tweet 
`browser.close()` | It will close the headless browser

## Contributing
If you encounter a bug or you want to add new features, feel free to submit issues and enhancement requests.

 1. **Fork** the repo on GitHub
 2. **Clone** the project to your own machine
 3. **Commit** changes to your own branch
 4. **Push** your work back up to your fork
 5. Submit a **Pull request**
