//Utils
const utils = {
    wait: (milliseconds)=>{
        return new Promise(function(resolve){
            setTimeout(function() {
                resolve();
            }, milliseconds);
        });
    }
}

const scrapingList = () => {
    const selectorResults = {
        results : '.reusable-search__entity-results-list',
        element: '.entity-result__item',
        clickeableElement: '.entity-result__title-line a',
        seeMore: '.search-results__cluster-bottom-banner a'
    }
    
    const createPopupResults = (resultsObj) => {
        const styleBackground = `
            position: fixed;
            z-index: 2000;
            width: 100%;
            height: 100vh;
            top: 0;
            left: 0;
            overflow: visible;
            display: flex;
            background-color: #00000055;
            justify-content: center;
            align-items:center;
            flex-flow: column;
        `
        const styleDiv = `
            z-index: 1000;
            width: 800px;
            height: 90%;
            overflow: hidden;
            display: flex;
            align-items: flex-end;
            background-color: #0b66c3;
            color: white;
            font-size: 30px;
            justify-content: center;
            align-items:center;
            flex-flow: column;
        `
        const stylePre = `
            width: 100%;
            font-size: 14px;
            overflow: auto;
        `

        const styleBtn = `
            cursor: pointer;
            background: #0b66c3;
            padding: 5px 10px;
            margin-bottom: 10px;
            font-size: 16px;
            color: white;
            font-weight: 600;
        `
        const background = document.createElement('div')
        background.style = styleBackground
        background.id = "krowdy-background"
        
        const div = document.createElement('div')
        div.id = "krowdy-message"
        div.style = styleDiv

        const btnClose = document.createElement('button')
        btnClose.style = styleBtn
        btnClose.innerText = 'Close window'
        btnClose.addEventListener('click', () => {
            const body = document.querySelector('body')
            body.removeChild(background)
        })
        const pre = document.createElement('pre')
        pre.style = stylePre
        let preContent = ''
        for(let obj of resultsObj) {
            preContent += JSON.stringify(obj,null,2)
        }
        pre.innerHTML = preContent
        div.appendChild(pre)
        background.appendChild(btnClose)
        background.appendChild(div)
        const bodyElement = document.querySelector('body')
        bodyElement.appendChild(background)
    }
    const initScrapingList = async () => {
        const { results, element, clickeableElement, seeMore } = selectorResults
        const seeMoreResults = document.querySelector(seeMore)
        // if(seeMoreResults) {
        if(false) {
            seeMoreResults.click()
            await utils.wait(4000)
        }
        const objResults = []
        let index = 0
        
        do {
            await utils.wait(3000)
            blockResults = document.querySelector(results)
            listResults = blockResults.querySelectorAll(element)
            if(!listResults || !listResults[index]) break;
            const profileToClick = listResults[index].querySelector(clickeableElement)
            profileToClick.click()
            const objResult = await scrapingProfile()
            objResults.push(objResult)
            console.log('resultados', objResults)
            history.back()
            index++
        } while(index < Array.from(listResults).length)

        createPopupResults(objResults)
    }

    initScrapingList()
}
const scrapingProfile = async ()=>{

    const autoscrollToElement = async function(cssSelector){

        var exists = document.querySelector(cssSelector);
    
        while(exists){
            //
            let maxScrollTop = document.body.clientHeight - window.innerHeight;
            let elementScrollTop = document.querySelector(cssSelector).offsetHeight
            let currentScrollTop = window.scrollY
    
    
            if(Math.abs(maxScrollTop - currentScrollTop) < 5 || elementScrollTop <= currentScrollTop)
                break;
    
            await utils.wait(32)
    
            let newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop);
            window.scrollTo(0,newScrollTop)
        }
    
        console.log('finish autoscroll to element %s', cssSelector);
    
        return new Promise(function(resolve){
            resolve();
        });
    };

    //Logic
    const selectorProfile = {
        personalInformation:{
            name:"div.ph5.pb5 > div.display-flex.mt2 ul li",
            title:"div.ph5.pb5 > div.display-flex.mt2 h2",
            resume: 'section.pv-about-section > p'
        },
        experienceInformation:{
            list : '#experience-section > ul > li',
            groupByCompany:{
                identify:'.pv-entity__position-group',
                company: 'div.pv-entity__company-summary-info > h3 > span:nth-child(2)',
                list: 'section > ul > li',
                title: 'div > div > div > div > div > div > h3 > span:nth-child(2)',
                date:'div > div > div > div > div > div > div > h4 > span:nth-child(2)',
                description: '.pv-entity__description'
            },
            default:{
                title: 'section > div > div > a > div.pv-entity__summary-info > h3',
                company:'section > div > div > a > div.pv-entity__summary-info > p.pv-entity__secondary-title',
                date: 'section > div > div > a > div.pv-entity__summary-info > div > h4.pv-entity__date-range > span:nth-child(2)',
                description: 'section > div > div > div > p'
            }
        },
        educationInformation:{
            list: '#education-section > ul > li',
            institution :'div > div > a > div.pv-entity__summary-info > div > h3',
            career : 'div > div > a > div.pv-entity__summary-info > div > p > span:nth-child(2)',
            date : 'div > div > a > div.pv-entity__summary-info > p > span:nth-child(2)'
        }
    }

    const clickOnMoreResume = async ()=>{
        const elementMoreResume = document.getElementById('line-clamp-show-more-button')
        if(elementMoreResume) elementMoreResume.click()
    }

    const getPersonalInformation = async ()=>{
        const {personalInformation:selector} = selectorProfile
        const elementNameProfile = document.querySelector(selector.name)
        const elementNameTitle = document.querySelector(selector.title)
        const elementResume = document.querySelector(selector.resume)
        
        const name = elementNameProfile?.innerText
        const title = elementNameTitle?.innerText
        const resume = elementResume?.innerText
        return {name,title,resume}
    }

    const getExperienceInformation = async ()=>{
        const {experienceInformation:selector} = selectorProfile
        //get information
        let experiencesRawList = document.querySelectorAll(selector.list)
        let experiencesRawArray = Array.from(experiencesRawList)

        const groupCompaniesList = experiencesRawArray.filter(el=>{
            let groupCompanyExperience = el.querySelectorAll(selector.groupByCompany.identify)  
            return groupCompanyExperience.length >0
        })

        const uniqueExperienceList = experiencesRawArray.filter(el=>{
            let groupCompanyExperience = el.querySelectorAll(selector.groupByCompany.identify)  
            return groupCompanyExperience.length ==0
        })
        
        const experiences = uniqueExperienceList.map(el=>{
            const title = el.querySelector(selector.default.title)?.innerText
            const date = el.querySelector(selector.default.date)?.innerText
            const company = el.querySelector(selector.default.company)?.innerText
            const description = el.querySelector(selector.default.description)?.innerText
            
            return {title,date,company,description}
        })

        for(let i = 0; i< groupCompaniesList.length;i++){
            const item = groupCompaniesList[i]
            const company = item.querySelector(selector.groupByCompany.company)?.innerText
            const itemsCompanyGroupList = item.querySelectorAll(selector.groupByCompany.list)
            const itemsCompanyGroupArray = Array.from(itemsCompanyGroupList)

            const experiencesData = itemsCompanyGroupArray.map(el=>{
                const title = el.querySelector(selector.groupByCompany.title)?.innerText
                const date = el.querySelector(selector.groupByCompany.date)?.innerText
                const description = el.querySelector(selector.groupByCompany.description)?.innerText
                
                return {title,date,company,description}
            })

            experiences.push(...experiencesData)
        }

        return experiences
    }

    const getEducationInformation = async ()=>{
        const {educationInformation:selector} = selectorProfile
        const educationItems = document.querySelectorAll(selector.list)
        const educationArray = Array.from(educationItems)
        const educations = educationArray.map(el=>{
            const institution = el.querySelector(selector.institution)?.innerText
            const career = el.querySelector(selector.career)?.innerText
            const date = el.querySelector(selector.date)?.innerText
            return {institution,career,date}
        })
        return educations
    }

    const createPopup = ()=>{
        const styleBackground = `
            position: fixed;
            z-index: 2000;
            width: 100%;
            height: 100vh;
            top: 0;
            left: 0;
            overflow: visible;
            display: flex;
            background-color: #00000055;
            justify-content: center;
            align-items:center;
        `
        const styleDiv = `
            z-index: 1000;
            width: 500px;
            height: 100px;
            overflow: visible;
            display: flex;
            align-items: flex-end;
            background-color: #0b66c3;
            padding: 10px;
            color: white;
            font-size: 30px;
            justify-content: center;
            align-items:center;
            flex-flow: column;
        `
        const background = document.createElement('div')
        background.style = styleBackground
        background.id = "krowdy-background"
        
        const div = document.createElement('div')
        div.id = "krowdy-message"
        div.style = styleDiv
        div.innerHTML=`
            <p style="color:white;font-size:inherit">Scanning profile...</p>
            <img style="width:30px" src="https://tradinglatam.com/wp-content/uploads/2019/04/loading-gif-png-4.gif" />
        `
        
        background.appendChild(div)
        const bodyElement = document.querySelector('div.body')
        bodyElement.appendChild(background)
        return { div }
    }
    
    //Scroll to all information
    await utils.wait(1000)

    const { div } = createPopup()

    await utils.wait(5000)

    await autoscrollToElement('body')
    await clickOnMoreResume()
    
    //Scraping Complete Profile
    const personalInformation =  await getPersonalInformation()
    const experienceInformation = await getExperienceInformation()
    const educationInformation = await getEducationInformation()
    
    
    div.innerHTML = `<p style="color:white;font-size:inherit">Scan finished</p>`
    // await utils.wait(1000)

    //Setting data to send information
    const profile = {...personalInformation, experiences:experienceInformation, educations:educationInformation }
    // pre.innerText = JSON.stringify(profile,null,2)

    // button.addEventListener("click",()=>{
    //     //Necesito el fetch
    //     div.remove()
    // })

    return(profile)
}



//Comunication
(function(){
chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
      const {acction} = msg
      console.log(acction)
    //   if (acction=="scraping") scrapingProfile()
      if (acction=="scraping") scrapingList()
    });
  })})();
