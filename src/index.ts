import { Bootstrap, RegisterModPackage } from "@hotbunny/hackhub-content-sdk";
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
        console.log("[millionairhack] MillionairHack loaded — eat the rich.");
    }

    OnModPackageUnloaded() {
        console.log("[millionairhack] MillionairHack unloaded.");
    }
}
