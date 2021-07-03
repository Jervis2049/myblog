const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://gitee.com/login");
    //username
    await page.type("#user_login", "你的gitee账号", { delay: 100 });
    //password
    await page.type("#user_password", "你的gitee密码", { delay: 100 });
    //login btn
    page.click('input[sa_evt="loginButtonClick"]')
    //wait for the selector to appear in page
    await page.waitForSelector('#users-dashboard')
    //go to the next page
    await page.goto("https://gitee.com/Jervis2049/Jervis2049/pages");
	//update btn
    page.click('.update_deploy')  
    //comfirm dialog
    await page.on('dialog', async dialog => { 
        console.log('ok')
        dialog.accept();
    })
    while (true) {
        await page.waitForTimeout(2000)
        try {
            let deploying = await page.$x('//*[@id="pages_deploying"]')
            if (deploying.length > 0) {
                console.log('update...')
            } else {
                console.log('complete')
                break;
            }
        } catch (err) {
            break;
        }
    }
    browser.close();
})()