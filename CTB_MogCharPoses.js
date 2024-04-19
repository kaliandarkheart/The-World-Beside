/*=============================================================================
 * CTB MogCharPoses
 * By CT_Bolt
 * CTB_MogCharPoses.js
 * Version: 1.7
 * Terms of Use:
 *   Free to use commercial or non-commercial. Happy Game Making! :)
 *
 *
 *
/*=============================================================================*/
var CTB = CTB || {};
CTB.MogCharPoses = CTB.MogCharPoses || {};
var Imported = Imported || {};
Imported["CT_Bolt MogCharPoses"] = 1.7;
//=============================================================================
/*:
 *
 * @plugindesc CT_Bolt's MogCharPoses Plugin v1.7
 * @author CT_Bolt
 *
 * @param ---Main---
 * @text Main Settings
 *
 *
 * @param Use Wait Pose
 * @text Use Wait Pose
 * @parent ---Main---
 * @desc Use Wait Pose?
 * (this is an eval so leave blank to not use)
 * @default true
 *
 * @param StandingFileName
 * @text Wait FileName Addon
 * @parent ---Main---
 * @desc The Wait FileName Addon (default: '_idle')
 *  Note: This is an eval, use quotes for basic usage
 * @default '_idle'
 *
 * @param Use Guard Pose
 * @text Use Guard Pose
 * @parent ---Main---
 * @desc Use Guard Pose?
 * (this is an eval so leave blank to not use)
 * @default true
 *
 * @param GuardFileName
 * @text Guard Filename Addon
 * @parent ---Main---
 * @desc The Guard FileName Addon (default: '_guard')
 *  Note: This is an eval, use quotes for basic usage
 * @default '_guard'
 *
 * @param Use Faint Pose
 * @text Use Faint Pose
 * @parent ---Main---
 * @desc Use Faint Pose?
 * (this is an eval so leave blank to not use)
 * @default true
 *
 * @param FaintFileName
 * @text Faint Filename Addon
 * @parent ---Main---
 * @desc The Faint FileName Addon (default: '_ko')
 *  Note: This is an eval, use quotes for basic usage
 * @default '_ko'
 *
 * @param Before Digits
 * @text Before Digits
 * @parent ---Main---
 * @desc Place filename addon before digits?
 * (Leave blank to use at the end of filename)
 * @default
 *
 * @param No Crash If File Not Found
 * @text File Not Found [No Crash]
 * @parent ---Main---
 * @desc Do Not Crash If File Not Found
 * @type boolean
 * @default true
 *
 * @param No MogPose
 * @text No MogPose Filename Text
 * @parent ---Main---
 * @desc Text Placed In Filename to determine if Mog Pose is Not Used.
 * @default '[nomog]'
 *
 * @param Use Standing Pose
 * @text Use Standing Pose
 * @parent ---Main---
 * @desc Use Standing Pose?
 * (this is an eval so leave blank to not use)
 * @default true
 *
 * @param WaitFileName
 * @text Standing FileName Addon
 * @parent ---Main---
 * @desc The Standing FileName Addon (default: '_standing')
 *  Note: This is an eval, use quotes for basic usage
 * @default '_standing'
 *
 * @param Standing Start Time
 * @text Standing Start Time
 * @parent ---Main---
 * @desc The amount of time before the standing animation starts
 *  Note: This is an eval
 * @default 300
 *
 * @param Time Standing
 * @text Time Standing
 * @parent ---Main---
 * @desc The amount of time before the standing animation stops
 *  Note: This is an eval
 * @default 300
 *
 * @param End Idle Time
 * @text End Idle Time
 * @parent ---Main---
 * @desc The amount of time before the idle timer is reset
 *  Note: This is an eval
 * @default 600
 *
 * @help
 * CT_Bolt's MogCharPoses
 * Version 1.7
 * CT_Bolt
 *
 * ***************** Description **********************
 * Adds an idle/wait/guard pose(s) when the player is waiting
 * Optional: Completely disable the poses using a unique string in the filename
 *
 * **************** Compatibility *********************
 * Place below Mog's Plugins
 *
 * ***************************************************
 *
 * History Log:
 *   Version 1.0 Initial Release (1/21/2020)
 *   Version 1.1 Bugfix (Jumping, Casting, Etc. now work again) (1/21/2020)
 *   Version 1.2 Bugfix (No more walk animation before victory) (1/21/2020)
 *   Version 1.3 Bugfix (Final Fixes... pretty sure... hopefully) (1/21/2020)
 *   Version 1.4 Added Feature (Guarding pose)
 *   Version 1.5 Added Features (2/26/2020)
 *   Version 1.6 Added Faint Pose (7/18/2020)
 *   Version 1.7 Added extra functions, rewrote some code (7/20/2020)
 *
 */

//=============================================================================
//=============================================================================

("use strict");
(function ($_$) {
  // Core Functions
  function getPluginParameters() {
    var a =
      document.currentScript ||
      (function () {
        var b = document.getElementsByTagName("script");
        return b[b.length - 1];
      })();
    return PluginManager.parameters(
      a.src.substring(a.src.lastIndexOf("/") + 1, a.src.indexOf(".js"))
    );
  }
  $_$.Param = getPluginParameters();
  function processText(inputText) {
    var output = [];
    var json = inputText.split(" ");
    json.forEach(function (item) {
      output.push(item.replace(/\'/g, "").split(/(\d+)/).filter(Boolean));
    });
    return output;
  }
  function fileExists(filename) {
    try {
      require("fs").accessSync(filename);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Alias
  $_$["Game_Character.prototype.preCachePoses"] =
    Game_Character.prototype.preCachePoses;
  Game_Character.prototype.preCachePoses = function () {
    if (
      this._originalName.name
        .toLowerCase()
        .includes(eval($_$.Param["No MogPose"]))
    ) {
      return;
    }
    $_$["Game_Character.prototype.preCachePoses"].apply(this);
  };

  // Alias NO MOG Pose
  $_$["Game_CharacterBase.prototype.setPose"] =
    Game_CharacterBase.prototype.setPose;
  Game_CharacterBase.prototype.setPose = function () {
    if (
      !this._originalName.name
        .toLowerCase()
        .includes(eval($_$.Param["No MogPose"]))
    ) {
      this._user = this._user || {};
      if (!this._eventId) {
        if (
          ($gameSystem._chronoMode.phase === 3 ||
            $gameSystem._chronoMode.phase === 4) &&
          !this.isActing() &&
          !this.isKnockbacking() &&
          !this.isAttacking() &&
          !this.isFaintPose() &&
          !this.isCasting() &&
          !this.isMoving() &&
          !this.isJumping()
        ) {
          this.ctb_noFilePoses = this.ctb_noFilePoses || [];
          this.ctb_noFilePoses["Guard"] = this.ctb_noFilePoses["Guard"] || [];
          this.ctb_noFilePoses["Wait"] = this.ctb_noFilePoses["Wait"] || [];

          if (this._user.battler) {
            if (
              this._user.battler.isGuardingCN() &&
              eval($_$.Param["Use Guard Pose"])
            ) {
              if (
                this.ctb_noFilePoses["Guard"].indexOf(
                  this._originalName.name + eval($_$.Param.GuardFileName)
                ) < 0
              ) {
                return this.setGuardingPose();
              }
            }

            if (eval($_$.Param["Use Wait Pose"])) {
              if (
                this.ctb_noFilePoses["Wait"].indexOf(
                  this._originalName.name + eval($_$.Param.WaitFileName)
                ) < 0
              ) {
                return this.setIdlePose();
              }
            }
          }
        }
      }

      if (this.isIdlePose()) {
        return this.setIdlePose();
      } else {
        this._poses.idle.timer = 0;
      }

      return $_$["Game_CharacterBase.prototype.setPose"].apply(this);
    } else {
      return this.setDefaultPose();
    }
  };

  // Idle Pose
  $_$["Game_CharacterBase.prototype.setIdlePose"] =
    Game_CharacterBase.prototype.setIdlePose;
  Game_CharacterBase.prototype.setIdlePose = function () {
    if (eval($_$.Param["Use Standing Pose"])) {
      this._poses.idle.timer = this._poses.idle.timer || 0;
      this._poses.idle[3] = true;
      if (this._poses.idle[4] === null) {
        this._poses.idle[4] = this._stepAnime;
      }
      this._stepAnime = true;
      if (this.isDiagonalIdlePose()) {
        return this.setDiagonalIdlePose();
      } else {
        var inputText = this._originalName.name;
        var a = processText(inputText)[0][0];

        var b = $_$.Param.StandingFileName
          ? eval($_$.Param.StandingFileName)
          : "_idle";

        this._poses.idle.timer = this._poses.idle.timer + 1;
        var st = eval(this._poses.idle.timing["Standing Start Time"]) || 300;
        if (
          this._poses.idle.timer >= st &&
          this._poses.idle.timer <=
            st + (eval(this._poses.idle.timing["Time Standing"]) || 300)
        ) {
          b = $_$.Param.WaitFileName
            ? eval($_$.Param.WaitFileName)
            : "_standing";
        }

        var eit = this._poses.idle.timing["End Idle Time"]
          ? eval(this._poses.idle.timing["End Idle Time"])
          : 600;
        if (this._poses.idle.timer >= eit) {
          this._poses.idle.timer = 0;
        }

        var c =
          String(processText(inputText)[0][1]) !== "undefined"
            ? processText(inputText)[0][1]
            : "";
        if (eval($_$.Param["Before Digits"])) {
          return a + b + c;
        } else {
          return inputText + b;
        }
      }
    } else {
      return $_$["Game_CharacterBase.prototype.setIdlePose"].apply(
        this,
        arguments
      );
    }
  };

  // Waiting Pose
  Game_CharacterBase.prototype.setWaitingPose = function () {
    if (this._poses.idle[4] === null) {
      this._poses.idle[4] = this._stepAnime;
    }
    this._stepAnime = true;
    if (this.isDiagonalIdlePose()) {
      return this.setDiagonalIdlePose();
    } else {
      var inputText = this._originalName.name;
      var a = processText(inputText)[0][0];
      var b = $_$.Param.StandingFileName
        ? eval($_$.Param.StandingFileName)
        : "_wait";
      var c =
        String(processText(inputText)[0][1]) !== "undefined"
          ? processText(inputText)[0][1]
          : "";
      if (eval($_$.Param["Before Digits"])) {
        return a + b + c;
      } else {
        return inputText + b;
      }
    }
  };

  // Guarding Pose
  Game_CharacterBase.prototype.setGuardingPose = function () {
    if (this._poses.idle[4] === null) {
      this._poses.idle[4] = this._stepAnime;
    }
    this._stepAnime = false;
    if (this.isDiagonalIdlePose()) {
      return this.setDiagonalIdlePose();
    } else {
      var inputText = this._originalName.name;
      var a = processText(inputText)[0][0];
      var b = $_$.Param.GuardFileName
        ? eval($_$.Param.GuardFileName)
        : "_guard";
      var c =
        String(processText(inputText)[0][1]) !== "undefined"
          ? processText(inputText)[0][1]
          : "";
      if (eval($_$.Param["Before Digits"])) {
        return a + b + c;
      } else {
        return inputText + b;
      }
    }
  };

  // No Crash Image placeholder
  Game_CharacterBase.prototype.setDefaultPose = function () {
    return this._originalName.name;
  };

  // if No Crash on File Not Found Parameter is set then overwrite
  if (eval($_$.Param["No Crash If File Not Found"])) {
    // Overwrite
    ImageManager.loadCharacter = function (filename, hue) {
      if (filename && filename != "") {
        if (fileExists("./img/characters/" + filename + ".png")) {
          // standard
          return this.loadBitmap("img/characters/", filename, hue, false);
        } else {
          //console.log("File not found: " + require("path").resolve("./")+"\\img\\characters\\"+filename+'.png');

          // create file not found image
          var b = new Bitmap(144, 192);
          b.fillAll("rgba(0,0,0,.8)");
          b.fontSize = 14;
          b.textBoxHeight = b.height / 4;
          b.textBoxWidth = b.width / 3;
          b.textColor = "rgba(255,0,0,1)";
          for (var i = 0; i < 4; i++) {
            b.drawText(
              "File",
              b.textBoxWidth * 0,
              b.fontSize * 0 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );
            b.drawText(
              "not",
              b.textBoxWidth * 0,
              b.fontSize * 1 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );
            b.drawText(
              "found",
              b.textBoxWidth * 0,
              b.fontSize * 2 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );

            b.textColor = "rgba(0,255,0,1)";
            b.drawText(
              "File",
              b.textBoxWidth * 1,
              b.fontSize * 0 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );
            b.drawText(
              "not",
              b.textBoxWidth * 1,
              b.fontSize * 1 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );
            b.drawText(
              "found",
              b.textBoxWidth * 1,
              b.fontSize * 2 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );

            b.textColor = "rgba(0,0,255,1)";
            b.drawText(
              "File",
              b.textBoxWidth * 2,
              b.fontSize * 0 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );
            b.drawText(
              "not",
              b.textBoxWidth * 2,
              b.fontSize * 1 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );
            b.drawText(
              "found",
              b.textBoxWidth * 2,
              b.fontSize * 2 + b.textBoxHeight * i + 3,
              b.textBoxWidth,
              b.fontSize,
              "center"
            );
          }
          return b;
        }
      } else {
        // standard
        return this.loadBitmap("img/characters/", filename, hue, false);
      }
    };
  }


  // Alias
  $_$["Game_CharacterBase.prototype.initCharPoses"] =
    Game_CharacterBase.prototype.initCharPoses;
  Game_CharacterBase.prototype.initCharPoses = function () {
    $_$["Game_CharacterBase.prototype.initCharPoses"].apply(this, arguments);
    this._poses = this._poses || {};
    this._poses.idle = this._poses.idle || {};
    this._poses.idle.timing = {};
    this._poses.idle.timing["Standing Start Time"] = $_$.Param[
      "Standing Start Time"
    ]
      ? eval($_$.Param["Standing Start Time"])
      : 300;
    this._poses.idle.timing["Time Standing"] = $_$.Param["Time Standing"]
      ? eval($_$.Param["Time Standing"])
      : 300;
    var startTime = this._poses.idle.timing["Standing Start Time"],
      timeStanding = this._poses.idle.timing["Time Standing"];
    this._poses.idle.timing["End Idle Time"] = $_$.Param["End Idle Time"]
      ? eval($_$.Param["End Idle Time"])
      : 600;
  };
})(CTB.MogCharPoses);
