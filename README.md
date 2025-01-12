## https://www.whalebeing.co/

## Inspiration

Up to 20,000 whales per year are killed by ships globally, posing a significant threat to already vulnerable whale populations. The issue of ship strikes is not only an tragedy for marine ecosystems but also an avoidable one: in many cases, reducing ship speeds and rerouting to avoid high-risk areas comes at little to no cost to ship operators.

To change this tragedy, we built WhaleBeing.

## What it does, and how we built it

**WhaleBeing uses a dynamic prediction model to display how ship routes interact with blue whale habitats using a web app.**

The core of our maching learning model is based off a 2019 research paper published in _ Diversity and Distributions (https://onlinelibrary.wiley.com/doi/full/10.1111/ddi.12940) _, and predicts daily, year-round habitat suitability for blue whales off the coast of California. We implemented a method using a Boosted Regression Tree and candidate Generalized Additive Mixed Models to use satellite data of tracked blue whales to produce a whale distribution prediction.

WhaleBeing enables users to search and visualize ship routes overlaid on our dynamic prediction heatmaps using the SeaRoutes API. Once a ship route is found, WhaleBeing calculates the likelihood of that route intersecting with areas of high blue whale activity by integrating the distribution weights along the nodes of the ship route.

This calculation is pivotal in assessing the risk of ship strikes and supports proactive decision-making to mitigate such risks, ultimately aiding in the protection of this endangered species.

## Challenges we ran into, and what we learned

Implementing the prediction model was a real challenge. We have little experience in data analysis, so we had to do extensive research and translate from R to Python in order to get our model working. We also faced hurdled at practically every step of the way, especially with integrating the SeaRoutes API and loading and displaying our animated heatmap.

**We learned that web dev is usually a bad idea, probably.**

## Accomplishments that we're proud of

For us, this project was a milestone in combining scientific research with practical software engineering to tackle a real-world problem. We successfully implemented a complex prediction model, APIs, and risk calculation into a cohesive and impactful web app. Most importantly, we're excited to take this further and potentially save thousands of whales. We're very proud of our final product. 

For those interested, our model is deployed on Microsoft Azure.

## What's next for WhaleBeing

We aim to expand WhaleBeing by:
▪️ Globalizing the model by adapting it to predict whale habitats in other regions with high ship traffic, namely the southern coast of Sri Lanka
▪️ Allowing users to input custom routes.
▪️ Partnering with maritime industries and conservation organizations to deploy WhaleBeing in real-world scenarios, starting with Oceans Canada and OceanWise for scaling with the best scientific data and proposing policy implementations to create incentive for ships
