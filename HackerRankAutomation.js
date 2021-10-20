// node HackerRankAutomation.js  --url="https://www.hackerrank.com" --config=config.json

// npm init -y
// npm install minimist
// npm install puppeteer

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let args = minimist(process.argv);
let fs = require("fs");
//console.log(args.url);
let configJSON = fs.readFileSync(args.config,"utf-8");
let configJSO = JSON.parse(configJSON);
const { cachedDataVersionTag } = require("v8");
//console.log(configJSO.userid);

// let browserLaunchkaPromise = puppeteer.launch({headless:false});
// browserLaunchkaPromise.then(function(browser){
//     let pagesKaPromise = browser.pages();
//     pagesKaPromise.then(function(pages){
//         let pageOpenKaPromise = pages[0].goto(args.url);
//         pageOpenKaPromise.then(function(){
//            let browserCloseKaPromise = browser.close();
//            browserCloseKaPromise.then(function(){
//                console.log("browser closed");
//            })
//         })
//     })
// })


// // IIFE - Immediately invoked function execution 
// (async function (){
//     let browser = await puppeteer.launch({headless:false});
//     let pages = await browser.pages();
//     await pages[0].goto(args.url);
//     await browser.close();
//     console.log("Browser Closed");

// })();

//always use async with await

//init();



//open browser 
async function run(){
    let browser = await puppeteer.launch({
        args:[
            '--start-maximized' // full screen 
         ],
        defaultViewport: null, // content in fullscreen 
        headless: false
    })

    // open a new tab 
    let pages = await browser.pages();
    let page = pages[0];

    //go to the url 
    await page.goto(args.url);

    // click on login 1
    await page.waitForSelector('a[data-event-action="Login"]');
    await page.click('a[data-event-action="Login"]');
    //await page.waitForTimeout(2000);

     //click on login 2
    await page.waitForSelector('a[href="https://www.hackerrank.com/login"]');
    await page.click('a[href="https://www.hackerrank.com/login"]');
    //await page.waitForTimeout(2000);

    //Enter username 
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]',configJSO.userid,{delay: 100});

    //Enter password 
    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]',configJSO.password,{delay: 100});

    //click Login 3 
    await page.waitForSelector('button[data-analytics="LoginPassword"]');
    await page.click('button[data-analytics="LoginPassword"]');

    // go to contest nav tab 
    await page.waitForSelector('a[data-analytics="NavBarContests"]');
    await page.click('a[data-analytics="NavBarContests"]');

    //go to manage contests 
    await page.waitForSelector('a[href="/administration/contests/"]');
    await page.click('a[href="/administration/contests/"]');
     
    await page.waitFor(3000);
    //find number of pages 
    await page.waitForSelector("a[data-attr1='Last']"); 
    let noOfPages = await page.$eval("a[data-attr1='Last']",function(atag)
    {
        let totalpages = parseInt(atag.getAttribute("data-page"));
        return totalpages;
    });
    
    //for each page collect all a href(contests) and then select each in new tab  
    for(let i=1;i<=noOfPages;i++)
    {
       await handleContestsOfaPage(page,browser);
       
       if(i!=noOfPages)
       {
       await page.waitForSelector("a[data-attr1='Right']");
       await page.click("a[data-attr1='Right']");
       }
    }
}


async function handleContestsOfaPage(page,browser){

    await page.waitForSelector("a.backbone.block-center");
    let curls = await page.$$eval("a.backbone.block-center",function(atags){
         let urls = [];
         for(let i=0;i < atags.length;i++)
         {
            let url = atags[i].getAttribute("href");
            urls.push(url);
         }
         return urls;
    });

   // console.log(curls);

    for(let i=0;i < curls.length; i++)
    {
        let ctab = await browser.newPage();
        await ctab.bringToFront();
        await ctab.goto(args.url + curls[i]);

        await ctab.waitFor(3000);

        await ctab.waitForSelector("li[data-tab='moderators']");
        await ctab.click("li[data-tab='moderators']");

        for(let i=0;i<configJSO.moderators.length;i++)
        {
            await ctab.waitForSelector('input#moderator');
            await ctab.type('input#moderator', configJSO.moderators[i] ,{delay: 120});
            await ctab.keyboard.press('Enter');
        }

        await ctab.waitFor(2000);
        await ctab.close();
        await ctab.waitFor(3000);

    }

}




run();