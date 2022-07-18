import puppeteer from 'puppeteer-core'
import os from 'os'
import fs from 'fs'

const macUrl = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const whidowsUrl = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const currentOs = os.type()
const launchConfig = {
  headless: false,
  defaultViewport: null,
  ignoreDefaultArgs: ['--disable-extensions'],
  args: [ '--no-sandbox', '--disable-setuid-sandbox', '--disable-notifications', '--disable-extensions'],
  executablePath: currentOs == 'Darwin' ? macUrl : whidowsUrl
}

const Crawler = function(sido, sigungu) {

  this.browser = null
  this.page = null
  this.pageLength = 0
  this.data = []

  this.launch = async () => {
    this.browser = await puppeteer.launch(launchConfig)

    const allPages = await this.browser.pages()

    this.page = allPages[0]

  }

  // 페이지 이동
  this.goto = async (url) => await this.page.goto(url)

  // alert 닫기
  this.alertClick = async () => {
    return await this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
  }

  this.checkPopup = async () => {
    let pages = await this.browser.pages()
    await pages[1].close()
  }

  // 시,도 선택
  this.evalCity = async () => {
    return await this.page.evaluate((sido) => {
      const seoulEl = document.querySelector(`#continents > li.${sido} > a`)
      seoulEl.click()
    }, sido)
  }

  // 시,군,구 선택
  this.evalCounty = async () => {
    await this.page.waitForSelector(`#continents > li.${sigungu} > a`)
    await this.page.evaluate((sigungu) => {
      const gangnamEl = document.querySelector(`#continents > li.${sigungu} > a`)
      gangnamEl.click()
    }, sigungu)
  }

  this.getPageLength = async () => {
    const pagingEl = `body > table:nth-child(2) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(5) > td > table:nth-child(5) > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(3)`
    await this.page.waitForSelector(pagingEl)
    this.pageLength = await this.page.evaluate((pagingEl) => {
      const pageLength = document.querySelector(pagingEl).children.length
      return pageLength
    }, pagingEl)
  }
  
  this.getData = async () => {

    for(let i=1; i<this.pageLength; i++) {
      const data = await this.page.evaluate((sido, sigungu) => {
        let jsonData = []
        document.querySelectorAll('#printZone > table:nth-child(2) > tbody tr').forEach(el => {
          let json = {
            sido,
            sigungu,
            name: '',
            address: '',
            tel: '',
            open: '',
          }
          const address = el.querySelector('.class_addr')?.innerText?.replaceAll('\n', '')?.replaceAll('\t','')
          if(address == undefined) return
  
          json.address = address
          json.name = el.querySelectorAll('td')[0]?.innerText?.replaceAll('\n', '')?.replaceAll('\t','')
          json.tel = el.querySelectorAll('td')[3]?.innerText?.replaceAll('\n', '')?.replaceAll('\t','')
          json.open = el.querySelectorAll('td')[4]?.innerText?.replaceAll('\n', '')?.replaceAll('\t','')
  
          jsonData.push(json)
        })
  
        return jsonData
      }, sido, sigungu)

      this.data = this.data.concat(data)

      await this.page.waitForTimeout(1000)

      await this.page.evaluate((i) => {
        document.querySelector(`body > table:nth-child(2) > tbody > tr > td:nth-child(1) > table > tbody > 
        tr > td:nth-child(2) > table > tbody > tr:nth-child(5) > td > table:nth-child(5) 
        > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(3)`).children[i].click()
      }, i)
      await this.page.waitForSelector('#printZone')
    }

  }

  this.writeFile = async () => {
    const writeData = JSON.stringify(this.data)
    const filePath = `./json/${sido}_${sigungu}.json`
    await fs.writeFileSync(filePath, writeData)
  }

}

export {
  Crawler
}