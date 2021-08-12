import puppeteer from 'puppeteer';

export interface User {
    username_or_email?: string;
    password?: string;
    username?: string;
    header?: string | null;
    profile_picture?: string | null;
    info?: string | null;
    bio?: string | null;
    website?: string | null;
    followers?: string | null;
    following?: string | null;
    browser: puppeteer.Browser;
    initializeBrowser(): Promise<void>;
    login(username_or_email: string, password: string): Promise<void>;
    getUserInfo(username: string): Promise<{}>;
    getFollwers(username: string): Promise<{}>;
    getFollwing(username: string): Promise<{}>;
    getTweet(link: string): Promise<{}>;
}

export class User implements User {
    username_or_email?: string;
    password?: string;
    username?: string;
    header?: string | null;
    profile_picture?: string | null;
    info?: string | null;
    bio?: string | null;
    website?: string | null;
    followers?: string | null;
    following?: string | null;
    browser!: puppeteer.Browser;
    async initializeBrowser(): Promise<void>{
        this.browser = await puppeteer.launch({ headless: true,
            args: ['--start-maximized'] // you can also use '--start-fullscreen'
         });
    }
    async login(username_or_email: string, password: string): Promise<void>{
        try {
            this.username_or_email = username_or_email;
            this.password = password;
            const page = await this.browser.newPage();
            await page.goto('https://twitter.com/login',{waitUntil: 'networkidle2',});
            // Enter username or email
            await page.waitForSelector('input[name="session[username_or_email]"]');
            await page.click('input[name="session[username_or_email]"]');
            await page.keyboard.type(this.username_or_email);
            // Enter  password 
            await page.waitForSelector('input[name="session[password]"]');
            await page.click('input[name="session[password]"]');
            await page.keyboard.type(this.password); 
            // Click on login button 
            await page.waitForSelector('div[data-testid="LoginForm_Login_Button"]');
            await page.click('div[data-testid="LoginForm_Login_Button"]');
            //role="button"
        } catch (error) {
            const err = ''+ error;
            if (err.match(/ERR_CONNECTION/)){
                throw 'CONNECTION FAILED';
            } else {
                throw 'Login failed, try again';
            };
        }

    }
    async getUserInfo(username: string): Promise<{}>{
        let page =  await this.browser.newPage();
        try {
            this.username = username;
            await page.goto(`https://twitter.com/${this.username}`, { waitUntil: 'networkidle2' });
            // get user's header
            this.header = await page.$eval(`a[href="/${this.username}/header_photo"] img`, element => element.getAttribute('src'));
            // get user's profile picture
            this.profile_picture = await page.$eval(`a[href="/${this.username}/photo"] img`, element => element.getAttribute('src'));
            // get user's info (e.g. location, birthday, etc.)
            this.info = await page.$eval('div[data-testid="UserProfileHeader_Items"]', element => element.textContent);
            // get user's bio
            this.bio = await page.$eval('div[data-testid="UserDescription"]', element => element.textContent)
            .catch(() =>{
                return null;
            });
            // get user's website
            this.website = await page.$eval('div[data-testid="UserProfileHeader_Items"] a', element => element.getAttribute('href'))
            .catch(() => {
                return null;
            });
            // get number of followers
            this.followers = await page.$eval(`a[href="/${this.username}/followers"]`, element => element.textContent);
            // get number of following
            this.following = await page.$eval(`a[href="/${this.username}/following"]`, element => element.textContent);

            return {User: {username: this.username, header: this.header, profile_picture: this.profile_picture, info: this.info,
                 bio: this.bio,website: this.website, followers: this.followers, following: this.following}};
            // page.close();
        } catch (error) {
            const err = ''+ error;
            if(err.match(/failed to find element matching selector/)){
                throw 'User Not Found';
            } else if (err.match(/ERR_CONNECTION/)){
                throw 'CONNECTION FAILED';
            } else {
                throw error;
            };
        }
    };
    async getFollowers(username: string): Promise<{}>{
        try {
            const page = await this.browser.newPage();
            await page.goto(`https://twitter.com/${username}/followers`,{waitUntil: 'networkidle2',});
            // Check and wait if the user has logged in
            try {
                await page.waitForSelector('a[aria-label="Profile"]', {timeout: 5000})
            } catch (error) {
                throw `You haven't logged in\n` + error
            }
            console.log('Please wait for a while.')
            let followers1: (string | null)[] = await page.$$eval('div[aria-label="Timeline: Followers"] a[href] div[dir="ltr"]',
            (followers) => followers.map((follower) => follower.textContent));
            let followers2: (string | null)[] = [];
            let previousHeight = 0;
            let scroll = true;
            // scroll to bottom
            while (scroll) {
                followers2 = await page.$$eval('div[aria-label="Timeline: Followers"] a[href] div[dir="ltr"]',
                (followers) => followers.map((follower) => follower.textContent));
                followers1.push(...followers2);
                previousHeight = await page.evaluate('document.body.scrollHeight');
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await page.waitForTimeout(3000);
                let currentHeight: number = await page.evaluate('document.body.scrollHeight');
                scroll = currentHeight > previousHeight;
            }
            const followers = new Set(followers1);
            return {followers: followers};
        } catch (error) {
            const err = ''+ error;
            if (err.match(/ERR_CONNECTION/)){
                throw 'CONNECTION FAILED';
            } else {
                throw error;
            };
        }
    }
    async getFollowing(username: string): Promise<{}>{
        try {
            const page = await this.browser.newPage();
            await page.goto(`https://twitter.com/${username}/following`,{waitUntil: 'networkidle2',});
        
            // Check and wait if the user has logged in
            try {
                await page.waitForSelector('a[aria-label="Profile"]', {timeout: 5000})
            } catch (error) {
                throw `You haven't logged in\n` + error
            }
            console.log('Please wait for a while.')
            let following1: (string | null)[] = await page.$$eval('div[aria-label="Timeline: Following"] a[href] div[dir="ltr"]',
            (following) => following.map((follow) => follow.textContent));
            let following2: (string | null)[] = [];
            let previousHeight = 0;
            let notEnd = true;
            // scroll to bottom
            while (notEnd) {
                following2 = await page.$$eval('div[aria-label="Timeline: Following"] a[href] div[dir="ltr"]',
                (following) => following.map((follow) => follow.textContent))
                following1.push(...following2);
                previousHeight = await page.evaluate('document.body.scrollHeight');
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await page.waitForTimeout(3000);
                let currentHeight: number = await page.evaluate('document.body.scrollHeight');
                notEnd = currentHeight > previousHeight
            }
            const following = new Set(following1);
            return {following: following};

        } catch (error) {
            const err = ''+ error;
            if (err.match(/ERR_CONNECTION/)){
                throw 'CONNECTION FAILED';
            } else {
                throw error;
            };
        }
    }
    async getTweet(link: string): Promise<{}>{
        try {
            const page = await this.browser.newPage();
            await page.goto(link, { waitUntil: 'networkidle2' });

            const author: (string | null)[] = await page.$$eval('article a[href] div[dir="ltr"]', (tweets) => tweets.map((tweet) => tweet.textContent));
            // get text of tweets  
            const text: (string | null)[] = await page.$$eval('article div[lang]', (tweets) => tweets.map((tweet) => tweet.textContent));
            // Get all images (e.g profile picture and tweet's images)
            const images: (string | null)[] = await page.$$eval('img', (imgs) =>imgs.map((img) => img.getAttribute('src')));  
            const img: string[] = [];
            // Get original tweet's images
            images.map((image)=>{
                if(image && image.match(/media/)){
                    img.push(image);
                }
            })
            const replies: string[] = []
            for(let i = 1; i<text.length && author.length; i++){
                replies.push(author[i] + ': ' + text[i]);
            }
            return {tweet: author[0] + ': '+ text[0], replies: replies, images: img};
        } catch (error) {
            throw error;
        }
    
    };
}