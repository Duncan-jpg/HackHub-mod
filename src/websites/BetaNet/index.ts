import { Website, RegisterWebsite, WebsitePageDefinition, Events, UI } from "@hotbunny/hackhub-content-sdk";
import homePage from "./pages/home.html";
import { ZARK } from "../../data/world";

// Plain, serialisable credentials so the WebView can validate the login
// synchronously (no async bridge round-trip that could hang/crash).
const ZARK_ACCOUNT = {
    user: ZARK.accountUser,
    password: ZARK.accountPassword,
};

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
        /** Synchronous credentials the WebView uses to validate the login. */
        account: ZARK_ACCOUNT,

        /** Fire-and-forget: tell the quest Zark's account was logged into. */
        reportZarkLogin: (): void => {
            Events.emit("MillionairHack.ZarkLoggedIn", { user: ZARK.accountUser });
        },

        /** Fire-and-forget: tell the quest Zark was blackmailed. */
        reportBlackmail: (): void => {
            Events.emit("MillionairHack.ZarkBlackmailed", {});
            UI.toast("Blackmail message delivered to Zark.", "success");
        },
    };
}
