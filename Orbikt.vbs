' Orbikt 啟動器 — 雙擊這個檔案開始使用 Orbikt。
' (Official entry point: runs the Launcher hidden; no terminal window appears.)
Option Explicit
Dim sh, fso, root, nodeCheck
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(WScript.ScriptFullName)

' Verify the runtime exists before doing anything (friendly message if not).
On Error Resume Next
nodeCheck = sh.Run("cmd /c where node >nul 2>nul", 0, True)
On Error Goto 0
If nodeCheck <> 0 Then
  MsgBox "Orbikt 需要的執行環境尚未安裝。" & vbCrLf & vbCrLf & _
         "請先安裝 Node.js（LTS 版本）後再試一次：" & vbCrLf & _
         "https://nodejs.org/", vbExclamation, "Orbikt 啟動器"
  WScript.Quit 1
End If

' Start the Launcher hidden. If one is already running, it just opens the
' existing page (single-instance behaviour inside server.mjs).
sh.CurrentDirectory = root
sh.Run "cmd /c node launcher\server.mjs", 0, False
