import { Quest, RegisterQuest, UI, Mail, Shell, Network } from "@hotbunny/hackhub-content-sdk";
import { ARMAZON, LEZOS_BANK } from "../data/world";

interface JeffLezosData {
    visited: boolean;
    hacked: boolean;
    walletFound: boolean;
    transferred: boolean;
}

/**
 * Jeff Lezos quest — stop the richest man alive from getting any richer by
 * draining his $50B fortune.
 */
@RegisterQuest
export class JeffLezosQuest extends Quest<JeffLezosData> {

    Name = "MillionairHack_JeffLezos";
    Title = "Jeff Lezos";
    Description = "Millionairs are to rich can you stop them getting richer?";
    Group = "side" as const;

    Employer = {
        firstName: "Robin",
        lastName: "Hood",
        email: "robin@redistribute.net",
    };

    Rewards = {
        xp: 1500,
        money: 25_000,
    };

    HackhubPost = {
        content:
            "Jeff Lezos has more money than entire countries and he wants MORE. " +
            "Someone with the right skills could break into armazon.org, find his " +
            "wallet and... redistribute it. Are you that someone?",
        author: { name: "Robin Hood" },
        likes: 1337,
        comments: [
            { author: { name: "tax_the_rich" }, content: "finally someone said it" },
            { author: { name: "anon99" }, content: "armazon's mainframe is a joke, try mhack" },
        ],
    };

    Mails = [
        {
            title: "A job for someone with a conscience",
            content:
                "Jeff Lezos is the richest man alive and he won't stop hoarding.\n\n" +
                "Here's the plan:\n" +
                "1. Visit his store at armazon.org.\n" +
                "2. Crack the mainframe with mhack (apt-get install mhack, then mhack -u armazon.org).\n" +
                "3. Get the IP from `whois armazon.org`, then open NetInfiltrator with the IP + the user/password mhack gives you.\n" +
                "4. His desktop has wallet.txt with his Liberty Central Bank login (username, password, IBAN). Download it.\n" +
                "5. Go to sbs.com, log in with that username + password + IBAN, and deposit all $50,000,000,000 into your own lcb.com account.\n\n" +
                "Take from the rich. You know the rest.\n\n— Robin",
        },
    ];

    Objectives = [
        {
            name: "visit_armazon",
            description: "Go to the website armazon.org",
            hint: "Open the FirebearBrowser and navigate to armazon.org.",
            terminalCommand: "",
        },
        {
            name: "hack_mainframe",
            description: "Hack into the mainframe",
            hint: "apt-get install mhack, then run: mhack -u armazon.org",
            unlocksAfter: ["visit_armazon"],
        },
        {
            name: "find_wallet",
            description: "Find the wallet file on the desktop of J. Lezos",
            hint: "whois armazon.org for the IP, then connect in NetInfiltrator with the IP + cracked login. Open/download desktop/wallet.txt for his bank details.",
            unlocksAfter: ["hack_mainframe"],
        },
        {
            name: "transfer_funds",
            description: "Add the money to your own bank account",
            hint: "Open sbs.com, log in with wallet.txt's username + password + IBAN, then on the Deposit tab enter your own IBAN and deposit the balance.",
            unlocksAfter: ["find_wallet"],
        },
    ];

    CreateData(): JeffLezosData {
        return { visited: false, hacked: false, walletFound: false, transferred: false };
    }

    OnStart() {
        UI.toast("New quest: Jeff Lezos", "info");
        this.sendMail(0);

        // Make the target resolvable in-world so whois/nmap behave.
        Network.registerDomain(ARMAZON.host, ARMAZON.ip);
        Shell.addCommandData("whois", ARMAZON.host, {
            ip: ARMAZON.ip,
            domain: ARMAZON.host,
            contact: "J. Lezos",
            email: "abuse@armazon.org",
            status: true,
        });
    }

    // Objectives in order. Completing one defensively completes everything
    // before it, so progress never gets stuck if an earlier event was missed.
    private readonly order = ["visit_armazon", "hack_mainframe", "find_wallet", "transfer_funds"];

    private complete(upTo: string) {
        const idx = this.order.indexOf(upTo);
        if (idx < 0) return;
        for (let i = 0; i <= idx; i++) {
            this.completeObjective(this.order[i]);
        }
    }

    OnObjectivesStart() {
        this.Events.on("Browser.WebsiteOpened", (e) => {
            const url = (e.url || "").toLowerCase();
            const name = (e.siteName || "").toLowerCase();
            if (url.includes(ARMAZON.host) || name === "armazon") {
                this.complete("visit_armazon");
            }
        });

        this.Events.on("MillionairHack.MainframeHacked", (e) => {
            if (e.host === ARMAZON.host) {
                this.complete("hack_mainframe");
            }
        });

        // The wallet objective is done as soon as NetInfiltrator connects to
        // J. Lezos' host (a valid IP/user/password reveals the file system).
        this.Events.on("MillionairHack.SystemBreached", (e) => {
            if (e.ip === ARMAZON.ip) {
                this.complete("find_wallet");
            }
        });

        this.Events.on("MillionairHack.WalletOpened", (e) => {
            if (e.ip === ARMAZON.ip) {
                this.complete("find_wallet");
            }
        });

        this.Events.on("MillionairHack.WalletDownloaded", (e) => {
            if (e.ip === ARMAZON.ip) {
                this.complete("find_wallet");
            }
        });

        // The whole quest completes when the stolen funds are deposited on sbs.com.
        this.Events.on("MillionairHack.FundsTransferred", () => {
            this.complete("transfer_funds");
        });
    }

    OnComplete() {
        UI.toast("Jeff Lezos is no longer a billionaire. Nice.", "success");
        Shell.removeCommandData("whois", ARMAZON.host);

        Mail.send({
            from: this.Employer!.email!,
            subject: "You're a legend",
            content:
                `You actually did it. $${LEZOS_BANK.balance.toLocaleString()} gone from Lezos' account.\n\n` +
                "The little guys thank you. On to the next one?\n\n— Robin",
        });
    }
}
