/**
 * @Author: ChrisChaoqun
 * @Date:   2019-06-04 11:29:22
 * @Last Modified by:   ChrisChaoqun
 * @Last Modified time: 2019-06-04 11:31:46
 */
"use strict";
import * as vscode from "vscode";

export class Utility {
  public static getConfiguration(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("coding");
  }
}
