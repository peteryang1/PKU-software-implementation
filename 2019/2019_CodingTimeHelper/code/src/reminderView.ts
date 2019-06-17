/**
 * @Author: ChrisChaoqun
 * @Date:   2019-06-04 14:47:08
 * @Last Modified by:   ChrisChaoqun
 * @Last Modified time: 2019-06-10 16:44:21
 */
"use strict";
import * as vscode from "vscode";
import Asset from "./asset";

export class ReminderView {
  private static panel: vscode.WebviewPanel | undefined;

  public static show(context: vscode.ExtensionContext, codingTime: number) {
    let asset: Asset = new Asset(context);
    const time = this.getTime(codingTime);
    const imagePath = asset.getImageUri();
    const title = `大佬,你今天已经coding了 ${time} ,可以休息一会。`;

    if (this.panel) {
      this.panel.webview.html = this.generateHtml(context, imagePath, title);
      this.panel.reveal();
    } else {
      this.panel = vscode.window.createWebviewPanel(
        "coding",
        "CodeTime",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );
      this.panel.webview.html = this.generateHtml(context, imagePath, title);
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }
  }

  protected static generateHtml(
    context: vscode.ExtensionContext,
    imagePath: vscode.Uri | string,
    title: string
  ): string {
    // const scripPathOnDisk = vscode.Uri.file(
    //   path.join(context.extensionPath, "media", "growth.js")
    // );

    // const scriptUri = scripPathOnDisk.with({ scheme: "vscode-resource" });

    let html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CodeTime</title>
      </head>
      <body>
          <div><img src="${imagePath}"></div>
          <div><h3>${title}</h3></div>
      </body>
      </html>`;

    return html;
  }

  protected static getTime(codingTime: number): string {
    let time: string;
    const sec = codingTime % 60;
    const min = Math.floor(codingTime / 60);
    if (min > 0) {
      time = `${min} min ${sec} sec`;
    } else {
      time = `${sec} sec`;
    }
    return time;
  }
}
