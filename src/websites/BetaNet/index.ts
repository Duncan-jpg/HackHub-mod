import { Website, RegisterWebsite, WebsitePageDefinition, Events, UI } from "@hotbunny/hackhub-content-sdk";
import homePage from "./pages/home.html";
import { ZARK } from "../../data/world";

interface BetaLoginResult {
    ok: boolean;
    name?: string;
    handle?: string;
}

/**
 * beta.net — a red, Meta-flavoured social network (legally distinct from any
 * real company). Home of Zark Buckerzurg and the second half of the mod.
 */
@RegisterWebsite
export class BetaNet extends Website {

    SiteName = "Beta";
    Host = "beta.net";
    Icon = "";

    Popular = true;

    Pages: WebsitePageDefinition[] = [
        {
            path: "/",
            title: "Beta — connect the metaverse",
            description: "Beta — bringing the metaverse to everyone. Founded by Zark Buckerzurg.",
            html: homePage,
            seo: true,
            search: ["beta", "social", "metaverse", "zark", "buckerzurg"],
        },
    ];

    Exports = {
        /** Log into Zark's account using the recovered credentials. */
        betaLogin: (user: string, password: string): BetaLoginResult => {
            const u = (user || "").trim().toLowerCase();
            const p = (password || "").trim();
            if (u === ZARK.accountUser.toLowerCase() && p === ZARK.accountPassword) {
                Events.emit("MillionairHack.ZarkLoggedIn", { user: ZARK.accountUser });
                return { ok: true, name: "Zark Buckerzurg", handle: "@zark" };
            }
            return { ok: false };
        },

        /** Send Zark a blackmail message after seeing his private posts. */
        blackmailZark: (message: string): { ok: boolean } => {
            void message;
            Events.emit("MillionairHack.ZarkBlackmailed", {});
            UI.toast("Blackmail message delivered to Zark.", "success");
            return { ok: true };
        },
    };
}
