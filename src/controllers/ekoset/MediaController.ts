import { JsonController, Body, UseBefore, Post, Req, Res, Param, Get, Header, OnUndefined, ContentType } from 'routing-controllers';
import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import ClassTransform from '@/utils/ClassTransform';
import FormMessageData from '@/entities/FormMessageData';
import ServiceContainer from '@/services/ServiceContainer';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer'
import { logger } from '@/utils/Logger';
import { Browser } from 'puppeteer';


const upload = multer();

@JsonController()
export default class MediaController extends BaseController {

  @UseBefore(upload.single('file'))
  @Post('/user/message')
  public async saveUserMessage (
    @Body() body: any,
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    const formData = JSON.parse(body.formMessageData);
    const formDataInstance = ClassTransform.plainToClassInstanceOne<FormMessageData>(formData, FormMessageData);

    const result = await ServiceContainer.MediaService.saveUserMessage(formDataInstance, file);
    return MediaController.createSuccessResponse(result, response);
  }

  @UseBefore(upload.single('file'))
  @Post('/admin/panel/sitesection/:sitesectionId/image/:bigOrSmall(big|small)')
  public async saveSiteSectionImage (
    @Param('sitesectionId') siteSectionId: number,
    @Param('bigOrSmall') bigOrSmall: string,
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    // const formData = JSON.parse(body.formMessageData);
    // const formDataInstance = ClassTransform.plainToClassInstanceOne<FormMessageData>(formData, FormMessageData);

    const result = await ServiceContainer.MediaService.saveSiteSectionImage(siteSectionId, file, bigOrSmall === 'big');
    return MediaController.createSuccessResponse(result, response);
  }


  @UseBefore(upload.single('file'))
  @Post('/admin/panel/service/:serviceId/image/:bigOrSmall(big|small)')
  public async saveServiceImage (
    @Param('serviceId') serviceId: number,
    @Param('bigOrSmall') bigOrSmall: string,
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    const result = await ServiceContainer.MediaService.saveServiceImage(serviceId, file, bigOrSmall === 'big');
    return MediaController.createSuccessResponse(result, response);
  }

  @UseBefore(upload.single('file'))
  @Post('/admin/panel/offer/:offerId/image/:bigOrSmall(big|small)')
  public async saveOfferImage (
    @Param('offerId') offerId: number,
    @Param('bigOrSmall') bigOrSmall: string,
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    const result = await ServiceContainer.MediaService.saveOfferImage(offerId, file, bigOrSmall === 'big');
    return MediaController.createSuccessResponse(result, response);
  }

  @UseBefore(upload.single('file'))
  @Post('/admin/panel/brands/:brandId/image/:bigOrSmall(big|small)')
  public async saveBrandImage (
    @Param('brandId') brandId: number,
    @Param('bigOrSmall') bigOrSmall: string,
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    const result = await ServiceContainer.MediaService.saveBrandImage(brandId, file, bigOrSmall === 'big');
    return MediaController.createSuccessResponse(result, response);
  }


  @UseBefore(upload.single('file'))
  @Post('/admin/panel/news/:newsId/image/:bigOrSmall(big|small)')
  public async saveNewsImage (
    @Param('newsId') brandId: number,
    @Param('bigOrSmall') bigOrSmall: string,
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    const result = await ServiceContainer.MediaService.saveNewsImage(brandId, file, bigOrSmall === 'big');
    return MediaController.createSuccessResponse(result, response);
  }


  @UseBefore(upload.single('file'))
  @Post('/admin/panel/recommendation/:id/image')
  public async saveRecommendationLetterImage (
    @Param('id') id: number,
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    const result = await ServiceContainer.MediaService.saveRecommendationLetterImage(id, file);
    return MediaController.createSuccessResponse(result, response);
  }

  @UseBefore(upload.single('file'))
  @Post('/admin/panel/sitepage/:sitePageId/image')
  public async saveSitePageImage (
    @Param('sitePageId') id: number,
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    const result = await ServiceContainer.MediaService.saveSitePageImage(id, file);
    return MediaController.createSuccessResponse(result, response);
  }


  @UseBefore(upload.single('file'))
  @Post('/admin/export/pdf')
  @OnUndefined(200)
  public async exportHtml2Pdf (
    @Req() request: Request,
    @Res() response: Response) {

    const file = request.file;
    const htmlContent = file.buffer.toString();
    const regexp = /<div.*?Trial.*?<\/div>/gm
    const htmlContentWithoutTrial = htmlContent.replace(regexp, '')

    const options = {
      format: 'A4',
      margin: {
        top: '15mm',            // default is 0, units: mm, cm, in, px
        right: '10mm',
        bottom: '15mm',
        left: '15mm'
      }, timeout: 1000000
    };


    const callback = (pdf) => {
      response.setHeader('Content-Type', 'application/pdf');
      response.send(pdf);
    }

    await this.convertHTMLToPDF(htmlContentWithoutTrial, callback, options, null, false);
    return response;
  }


  public convertHTMLToPDF = async (html, callback, options = null, puppeteerArgs = null, remoteContent = true) => {
    if (typeof html !== 'string') {
      throw new Error(
        'Invalid Argument: HTML expected as type of string and received a value of a different type. Check your request body and request headers.'
      );
    }
    let browser: Browser;
    if (puppeteerArgs) {
      browser = await puppeteer.launch(puppeteerArgs);
    } else {
      browser = await puppeteer.launch();
    }

    const page = await browser.newPage();

    if (remoteContent === true) {
      await page.goto(`data:text/html;base64,${Buffer.from(html).toString('base64')}`, {
        waitUntil: 'networkidle0'
      });
    } else {
      await page.setContent(html);
    }

    await page.pdf(options).then(callback, (error) => {
      logger.error(error);
    });
    await browser.close();
  };

}

