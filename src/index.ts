import { Bootstrap, RegisterModPackage, Events } from "@hotbunny/hackhub-content-sdk";
import "./commands/MhackCommand";
import "./apps/NetInfiltrator";
import "./websites/Armazon";
import "./websites/BetaNet";
import "./websites/SecureBankingSkills";
import "./quests/JeffLezosQuest";
import "./quests/ZarkBuckerzurgQuest";

@RegisterModPackage
export default class Millionairhack extends Bootstrap {

    async OnModPackageLoaded() {
        // Register custom events so they're routed to quest listeners /
        // declarative triggers reliably.
        [
            "MillionairHack.MainframeHacked",
            "MillionairHack.SystemBreached",
            "MillionairHack.WalletOpened",
            "MillionairHack.WalletDownloaded",
            "MillionairHack.ZarkSecretsFound",
            "MillionairHack.FundsTransferred",
            "MillionairHack.ZarkLoggedIn",
            "MillionairHack.ZarkBlackmailed",
        ].forEach((name) => Events.register(name));

        console.log("[millionairhack] MillionairHack loaded — eat the rich.");
    }

    OnModPackageUnloaded() {
        console.log("[millionairhack] MillionairHack unloaded.");
    }
}
