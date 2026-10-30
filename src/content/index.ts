/**
 * NGA BBS Script Content Script Entry Point
 */
import { NGABBSScript } from './core/app';
import { StyleModule } from './modules/StyleModule';
import { UIHidingModule } from './modules/UIHiding';
import { ImgEnhanceModule } from './modules/ImgEnhance';
import { ExcelModeModule } from './modules/ExcelMode';
import { LinkAndQuoteModule } from './modules/LinkAndQuote';
import { AuthorMarkModule } from './modules/AuthorMark';
import { AutoPageModule } from './modules/AutoPage';
import { UserEnhanceModule } from './modules/UserEnhance';
import { MarkAndBanModule } from './modules/MarkAndBan';
import { KeywordsBlockModule } from './modules/KeywordsBlock';
import { DomainRedirectModule } from './modules/DomainRedirect';

console.log('[NGA-Neo] Plugin loaded successfully!');

const app = new NGABBSScript();

app.addModule(StyleModule);
app.addModule(UIHidingModule);
app.addModule(ImgEnhanceModule);
app.addModule(ExcelModeModule);
app.addModule(LinkAndQuoteModule);
app.addModule(AuthorMarkModule);
app.addModule(AutoPageModule);
app.addModule(UserEnhanceModule);
app.addModule(MarkAndBanModule);
app.addModule(KeywordsBlockModule);
app.addModule(DomainRedirectModule);

app.run();
