const Page = require('./helpers/page')

let page

beforeEach(async () => {
    page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close();
})


describe('create a blog when logged in', async () =>{
    beforeEach(async () =>{
        await page.login()
        await page.click('a.btn-floating')
    })

    test('can see blog create form', async () => {
        const label = await page.getContentsOf('form label')
        expect(label).toEqual('Blog Title')
    })

    describe('And using invalid inputs', async () =>{
        beforeEach(async () =>{
            await page.click('form button')
        })
        test('The form shows an error message', async () =>{
            const titleError = await page.getContentsOf('.title .red-text')
            const contentError = await page.getContentsOf('.content .red-text')

            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        })
    })
    describe('and using valid inputs', async () =>{
        beforeEach(async () =>{
            await page.type('.title input', 'Test Title')
            await page.type('.content input', 'Test Content')
            await page.click('form button')
        })
        test('submitting takes user to review screen', async () =>{
            const confirmation = await page.getContentsOf('h5')
            expect(confirmation).toEqual('Please confirm your entries')
        })

        test('submitting and saving adds blog to index page', async () =>{
            await page.click('button.green')
            await page.waitFor('.card')
            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')
            expect(title).toEqual('Test Title')
            expect(content).toEqual('Test Content')
        })
    })
})

describe('User is not logged in', async () => {
    test('user cannot create blog posts', async () => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title: 'Test Title', content: 'Test Content'})
            }).then(res => res.json())
        })
        expect(result).toEqual({error: 'You must log in!'})
    })
    test('user cannot view blog posts', async () => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(res => res.json())
        })
        expect(result).toEqual({error: 'You must log in!'})
    })

})