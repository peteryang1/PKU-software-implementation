/**
 * @Author: ChrisChaoqun
 * @Date:   2019-06-04 11:32:32
 * @Last Modified by:   ChrisChaoqun
 * @Last Modified time: 2019-06-04 14:46:06
 */
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { Utility } from "./utility";

export default class Asset {
  public readonly TYPE_URL_IMAGE = "url";
  public readonly TYPE_DEFAULT = "default";

  public constructor(private context: vscode.ExtensionContext) {}

  public getImageUri(): vscode.Uri | string {
    const type: string = this.getConfigType();
    let images: vscode.Uri[] | string[] = [];

    if (type === this.TYPE_URL_IMAGE) {
      images = this.getCustomImages();
    }

    const image = this.getRandomOne(images);

    return image;
  }

  protected getRandomOne(images: vscode.Uri[] | string[]): vscode.Uri | string {
    const n = Math.floor(Math.random() * images.length + 1) - 1;
    return images[n];
  }

  protected getConfigType(): string {
    return Utility.getConfiguration().get<string>("type", "default");
  }

  protected getCustomImages() {
    return Utility.getConfiguration().get<string[]>("customImages", []);
  }

  public getTitle(): string {
    return Utility.getConfiguration().get<string>("title", "");
  }
}
