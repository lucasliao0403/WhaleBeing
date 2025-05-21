## https://www.whalebeing.co/ | [Video Demo](https://www.youtube.com/watch?v=EwOxT8YSXnk&embeds_referring_euri=https%3A%2F%2Fdevpost.com%2F&source_ve_path=MjM4NTE) | [Devpost](https://devpost.com/software/whalebeing-27sj0w)

Up to 20,000 whales per year are killed by ships globally, posing a significant threat to already vulnerable whale populations. The issue of ship strikes is not only an tragedy for marine ecosystems but also an avoidable one: in many cases, reducing ship speeds and rerouting to avoid high-risk areas comes at little to no cost to ship operators.

**WhaleBeing uses a dynamic prediction model to display how ship routes interact with blue whale habitats using a web app.**

The core of our maching learning model is based off a 2019 research paper published in _ Diversity and Distributions (https://onlinelibrary.wiley.com/doi/full/10.1111/ddi.12940) _, and predicts daily, year-round habitat suitability for blue whales off the coast of California. We implemented a method using a Boosted Regression Tree and candidate Generalized Additive Mixed Models to use satellite data of tracked blue whales to produce a whale distribution prediction.

WhaleBeing enables users to search and visualize ship routes overlaid on our dynamic prediction heatmaps using the SeaRoutes API. Once a ship route is found, WhaleBeing calculates the likelihood of that route intersecting with areas of high blue whale activity by integrating the distribution weights along the nodes of the ship route.

This calculation is pivotal in assessing the risk of ship strikes and supports proactive decision-making to mitigate such risks, ultimately aiding in the protection of this endangered species.

Built in Flask and Next.js with MapBox.

#### Prerequisites

- **Node.js ≥ 18**
- **Python 3.10+** and **pip**
- **Mapbox Access Token**: Obtain from [Mapbox](https://account.mapbox.com/access-tokens/) and set as a .env variable.

