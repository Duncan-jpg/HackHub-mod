import { Website, RegisterWebsite, WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";
import homePage from "./pages/home.html";
import aboutPage from "./pages/about.html";

/**
 * armazon.org — a green Amazon-style storefront that (instead of random junk)
 * sells fake hacking gear. It is the public face of J. Lezos' empire and the
 * entry point of the Jeff Lezos quest.
 */
@RegisterWebsite
export class Armazon extends Website {

    SiteName = "Armazon";
    Host = "armazon.org";
    Icon = "";

    Popular = true;

    Pages: WebsitePageDefinition[] = [
        {
            path: "/",
            title: "Armazon.org — Everything for the modern hacker",
            description: "Armazon — the everything store for hackers. Owned by J. Lezos.",
            html: homePage,
            seo: true,
            search: ["armazon", "shop", "hacking", "lezos", "store"],
        },
        {
            path: "/about",
            title: "Armazon.org — About J. Lezos",
            description: "About Armazon and its founder J. Lezos.",
            html: aboutPage,
            seo: true,
            search: ["armazon", "about", "lezos"],
        },
    ];

    Exports = {
        formatPrice: (n: number) => "$" + n.toLocaleString(),
    };
}
