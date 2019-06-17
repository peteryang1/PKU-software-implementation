/**
 * @Author: ChrisChaoqun
 * @Date:   2019-06-04 15:06:40
 * @Last Modified by:   ChrisChaoqun
 * @Last Modified time: 2019-06-16 14:49:32
 */
"use strict";
import * as vscode from "vscode";
import { ReminderView } from "./reminderView";
import { Scheduler } from "./scheduler";
import { CatCodingPanel } from "./catCodingPanel";
import { TimerState } from "./enum";
import { Timer } from "./timer";
import { format } from "date-fns";

let myStatusBarItem: vscode.StatusBarItem;
const DEF_SEC: number = 60;

export function activate(context: vscode.ExtensionContext) {
  const scheduler = new Scheduler(context);
  scheduler.start();

  let status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    200
  );
  status.command = "extension.switchTimer";

  let timer: Timer;
  updateTimerStatus(status, Number(new Date()));
  status.show();

  let start = vscode.commands.registerCommand(
    "extension.startTimer",
    async () => {
      const prompt = "How long will you need a Time to code in seconds?";
      const value = String(timer ? timer.timeSec : DEF_SEC);
      const secStr = await vscode.window.showInputBox({ prompt, value });

      let newSec;
      if (secStr && Number.isSafeInteger(Number(secStr))) {
        newSec = Number(secStr);
      }

      if (!timer) {
        timer = new Timer(newSec || DEF_SEC);
        timer.onTimeChanged(({ datetime, leftSec }) => {
          updateTimerStatus(status, datetime, leftSec);
        });

        timer.onTimeEnd(() => {
          vscode.window.showInformationMessage("Timer is UP!!!");
          updateTimerStatus(status, Number(new Date()), 0);
          timer.reset();
          scheduler.show(context);
          // timer.start();
        });
      }
      Start(timer, newSec);
    }
  );

  let stop = vscode.commands.registerCommand("extension.stopTimer", () => {
    const state = timer.state;
    if (state === TimerState.Running) {
      vscode.window.showInformationMessage("Timer Stopped!!!");
    }
    timer.stop();
  });

  let pause = vscode.commands.registerCommand("extension.pauseTimer", () => {
    const state = timer.state;
    if (state === TimerState.Running) {
      vscode.window.showInformationMessage("Timer Paused!!!");
      timer.pause();
    }
  });

  let switchTimer = vscode.commands.registerCommand(
    "extension.switchTimer",
    () => {
      const state = timer.state;
      if (state === TimerState.Stopped) {
        vscode.window.showInformationMessage("Timer Started!!!");
        timer.reset();
        timer.start();
      } else if (state === TimerState.Paused) {
        vscode.window.showInformationMessage("Timer Started!!!");
        timer.start();
      } else {
        vscode.window.showInformationMessage("Timer Paused!!!");
        timer.pause();
      }
    }
  );

  context.subscriptions.push(status);
  context.subscriptions.push(start, stop, pause, switchTimer);

  // const myCommandId = "extension.showSelectionCount";
  // context.subscriptions.push(
  //   vscode.commands.registerCommand(myCommandId, () => {
  //     let n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
  //     vscode.window.showInformationMessage(
  //       `Yeah, ${n} line(s) selected... Keep going!`
  //     );
  //   })
  // );
  // myStatusBarItem = vscode.window.createStatusBarItem(
  //   vscode.StatusBarAlignment.Right,
  //   100
  // );
  // myStatusBarItem.command = myCommandId;
  // context.subscriptions.push(myStatusBarItem);
  // context.subscriptions.push(
  //   vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
  // );
  // context.subscriptions.push(
  //   vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem)
  // );

  // updateStatusBarItem();

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.helloPanel", () => {
      scheduler.show(context);
    })
  );

  let disposable = vscode.commands.registerCommand(
    "extension.showWindow",
    () => {
      vscode.window.showInformationMessage(
        "current window is " + vscode.window.state.focused
      );
    }
  );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand("catCoding.start", () => {
  //     CatCodingPanel.createOrShow(context.extensionPath);
  //   })
  // );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand("catCoding.doRefactor", () => {
  //     if (CatCodingPanel.currentPanel) {
  //       CatCodingPanel.currentPanel.doRefactor();
  //     }
  //   })
  // );

  // if (vscode.window.registerWebviewPanelSerializer) {
  //   vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
  //     async deserializeWebviewPanel(
  //       webviewPanel: vscode.WebviewPanel,
  //       state: any
  //     ) {
  //       console.log(`Got state: ${state}`);
  //       CatCodingPanel.revive(webviewPanel, context.extensionPath);
  //     }
  //   });
  // }
}

export function deactivate() {}

// function getNumberOfSelectedLines(
//   editor: vscode.TextEditor | undefined
// ): number {
//   let lines = 0;
//   if (editor) {
//     lines = editor.selections.reduce(
//       (prev, curr) => prev + (curr.end.line - curr.start.line),
//       0
//     );
//   }
//   return lines;
// }

// function updateStatusBarItem(): void {
//   let n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
//   if (n > 0) {
//     myStatusBarItem.text = `$(megaphone) ${n} line(s) selected`;
//     myStatusBarItem.show();
//   } else {
//     myStatusBarItem.hide();
//   }
// }

function updateTimerStatus(
  status: vscode.StatusBarItem,
  sec: number,
  leftSec?: number
) {
  let YMD, left;
  if (sec) {
    YMD = format(sec, "MM-DD HH:mm");
  }
  if (leftSec !== undefined) {
    const sec = leftSec % 60;
    const min = Math.floor(leftSec / 60);
    if (min > 0) {
      left = `${min} min ${sec} sec`;
    } else {
      left = `${sec} sec`;
    }
  } else {
    left = "-";
  }

  status.text = `${left} to code || time [${YMD}]`;
}

function Start(timer: Timer, sec: number | undefined) {
  const state = timer.state;
  const timeSec = timer.timeSec;
  const needSwitch = sec !== undefined && sec !== timeSec;

  if (state === TimerState.Stopped || state === TimerState.Running) {
    timer.reset(needSwitch === true ? sec : undefined);
    timer.start();
    vscode.window.showInformationMessage("Timer Started!!!");
  }

  if (state === TimerState.Paused) {
    timer.start();
    vscode.window.showInformationMessage("Timer Started!!!");
  }
}
