const axios = require('axios');
const cheerio = require('cheerio');
const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});


async function scrapPosts(req, res){

    try {

        let comments = '';
        var topicId = req.params.topicId; 

        const website = `https://forum.lowyat.net/topic/${topicId}`;
        await axios(website).then(async (res) => {
            const data = res.data;
            const $ = cheerio.load(data);
            var total = (+$(".pagelink").first().text().replace(" Pages", "")) * 20;
            let posts = [];            
            if(total > 0){
                for(var i = 0; i < 3 ; i++){
                    total -= 20;
                    if(total <= 0){
                        break;
                    }
                    var url = `${website}/+${total}`;
            
                    await axios(url).then((res) => {
                        const html = res.data
                        const $ = cheerio.load(html);
                        $('.post_text').each(function (i, elem) {
                            posts.push($(elem).text().trim());
                        });
                    });
                }
            }
            if(posts.length){
                comments = posts.join("\n");
            }
        });
        data = {aggPost: comments};
    } catch (error) {
        res.status(422)
        data = {error: error.message};
    }

    res.json(data);
}


async function scrapGoogleSearch(req, res){

    try{

        let query = '';
        let url = '';
        if(req.body && req.body.propSearch){
            query = Buffer.from(req.body.propSearch, "base64").toString("utf8");
        }
    
        if(query){
            const input = {
                "queries": query,
                "maxPagesPerQuery": 1,
                "resultsPerPage": 1,
                "countryCode": "",
                "customDataFunction": async ({ input, $, request, response, html }) => {
                  return {
                    pageTitle: $('title').text(),
                  };
                }
            };
    
            await (async () => {
                // Run the actor and wait for it to finish
                const run = await client.actor("apify/google-search-scraper").call(input);
            
                // Fetch and print actor results from the run's dataset (if any)
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                if(items.length > 0 && items[0].organicResults.length > 0 && items[0].organicResults[0].url){
                    url = items[0].organicResults[0].url
                }
            })();
        }
        data = {url: url};
    }catch(error){
        res.status(422)
        data = {error: error.message};
    }

    res.json(data);
   
}

module.exports = {
    scrapPosts,
    scrapGoogleSearch
}