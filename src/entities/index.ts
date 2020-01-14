import { AppUser } from '@/entities/users/AppUser';
import { AppUserSession } from '@/entities/users/AppUserSession';
import { AppUserSocialNetProfile } from '@/entities/users/AppUserSocialNetProfile';
import { Article } from './ekoset/Article';
import { SiteSection } from './ekoset/SiteSection';
import { BusinessService } from './ekoset/BusinessService';
import { ClActivity } from './ekoset/ClActivity';
import { ClArticleTag } from './ekoset/ClArticleTag';
import { ClBrand } from './ekoset/ClBrand';
import { ClMetaTag } from './ekoset/ClMetaTag';
import { ClSiteSetting } from './ekoset/ClSiteSetting';
import { IndividualOffer } from './ekoset/IndividualOffer';
import { MetaTagContent } from './ekoset/MetaTagContent';
import { SiteSocialNetwork } from './ekoset/SiteSocialNetwork';
import { ClClient } from './ekoset/ClClient';
import { PartnerGroup } from './ekoset/PartnerGroup';
import { Partner } from './ekoset/Partner';
import { ReccomendationLetter } from './ekoset/ReccomendationLetter';
import SitePage from './ekoset/SitePage';
import { ProxyItem } from './proxy/ProxyItem';


const entityModelMetadata = [
  AppUser, AppUserSession, AppUserSocialNetProfile, Article, BusinessService, SiteSection, ClActivity, ClArticleTag, ClBrand,
  ClMetaTag, ClSiteSetting, IndividualOffer, MetaTagContent, SiteSocialNetwork, ClClient, PartnerGroup, Partner, ReccomendationLetter, SitePage, ProxyItem
];



export default entityModelMetadata;



