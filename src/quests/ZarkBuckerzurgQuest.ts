import { Quest, RegisterQuest, UI, Mail, Shell, Network } from "@hotbunny/hackhub-content-sdk";
import { BETANET, ZARK } from "../data/world";

interface ZarkData {
    fsAccess: boolean;
    loggedIn: boolean;
    blackmailed: boolean;
}

/**
 * Zark Buckerzurg quest — break into Beta, log in as its lizard CEO and
 * blackmail him with what you find.
 */
@RegisterQuest
export class ZarkBuckerzurgQuest extends Quest<ZarkData> {

    Name = "MillionairHack_ZarkBuckerzurg";
    Title = "Zark Buckerzurg";
    Description = "The metaverse made him a billionaire. His secrets can make him pay.";
    Group = "side" as const;

    Employer = {
        firstName: "Robin",
        lastName: "Hood",
        email: "robin@redistribute.net",
    };

    Rewards = {
        xp: 2000,
        money: 75_000,
    };

    QuestsToComplete = ["MillionairHack_JeffLezos"];

    HackhubPost = {
        content:
            "Zark Buckerzurg sold everyone's data twice and bought a private island with it. " +
            "Word is beta.net's filesystem is wide open if you have the right tools. " +
            "Find his secrets and make him regret it.",
        author: { name: "Robin Hood" },
        likes: 909,
        comments: [
            { author: { name: "deleted_my_beta" }, content: "lizard man going down" },
        ],
    };

    Mails = [
        {
            title: "Next target: Zark Buckerzurg",
            content:
                "Zark Buckerzurg runs beta.net and he's hiding something big.\n\n" +
                "Plan:\n" +
                "1. Break into beta.net's file system: whois beta.net for the IP, mhack -u beta.net for the login, then open it in NetInfiltrator.\n" +
                "2. His files contain his personal account login. Use it to log into beta.net as Zark.\n" +
                "3. Read his private posts, then blackmail him.\n\n" +
                "Make him sweat.\n\n— Robin",
        },
    ];

    Objectives = [
        {
            name: "access_fs",
            description: "Acquire access to the file system of beta.net",
            hint: "whois beta.net, mhack -u beta.net, then connect with NetInfiltrator.",
        },
        {
            name: "login_zark",
            description: "How do you log into Zark's account",
            hint: "His login is in account.txt on his desktop. Use it on beta.net.",
            unlocksAfter: ["access_fs"],
        },
        {
            name: "blackmail_zark",
            description: "Blackmail Zark",
            hint: "Once logged in as Zark, read his private posts and send him a blackmail message.",
            unlocksAfter: ["login_zark"],
        },
    ];

    CreateData(): ZarkData {
        return { fsAccess: false, loggedIn: false, blackmailed: false };
    }

    OnStart() {
        UI.toast("New quest: Zark Buckerzurg", "info");
        this.sendMail(0);

        Network.registerDomain(BETANET.host, BETANET.ip);
        Shell.addCommandData("whois", BETANET.host, {
            ip: BETANET.ip,
            domain: BETANET.host,
            contact: "Z. Buckerzurg",
            email: "abuse@beta.net",
            status: true,
        });
    }

    OnObjectivesStart() {
        this.Events.on("MillionairHack.SystemBreached", (e) => {
            if (e.ip === BETANET.ip) {
                this.SetData("fsAccess", true);
                this.completeObjective("access_fs");
            }
        });

        this.Events.on("MillionairHack.ZarkLoggedIn", () => {
            this.SetData("loggedIn", true);
            this.completeObjective("login_zark");
        });

        this.Events.on("MillionairHack.ZarkBlackmailed", () => {
            this.SetData("blackmailed", true);
            this.completeObjective("blackmail_zark");
        });

        // Also accept blackmail sent the classic way: an email to Zark.
        this.Events.on("Mail.Sent", (e) => {
            if ((e.to || "").toLowerCase().includes(ZARK.blackmailEmail)) {
                this.SetData("blackmailed", true);
                this.completeObjective("blackmail_zark");
            }
        });
    }

    OnComplete() {
        UI.toast("Zark Buckerzurg has been thoroughly blackmailed.", "success");
        Shell.removeCommandData("whois", BETANET.host);

        Mail.send({
            from: this.Employer!.email!,
            subject: "Two down",
            content:
                "The lizard is squirming. Excellent work.\n\n" +
                "You've made the metaverse a slightly fairer place.\n\n— Robin",
        });
    }
}
