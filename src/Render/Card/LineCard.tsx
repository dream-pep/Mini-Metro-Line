import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Line } from "../../DataStructure/Line";
import { Station } from "../../DataStructure/Station";
import { DisplayStation } from "../../DataStructure/Display";
import "./LineCard.scss";
import ArrowIcon from "../../Resource/Icon/arrow";
import PlusIcon from "../../Resource/Icon/plus";

import ExpandIcon from "../../Resource/Icon/expand";
import ShrinkIcon from "../../Resource/Icon/shrink";
import EditIcon from "../../Resource/Icon/edit";

import classNames from "classnames";
import {
  CardShowing,
  InsertInfo,
  LineProps,
  StationProps,
  UserDataType,
  dataProcessor,
} from "../../Data/UserData";
import {
  browserInfo,
  mapToArr,
  onWheelX,
  onWheelY,
  scrollOptimize,
} from "../../Common/util";
import { AutoGrowthInput } from "../../Common/AutoGrowthInput";
import { colorSH, colorSHMap } from "../../Common/color";
import { showConfirmationInterface } from "../Delete/DeleteConfirmation";
import { FunctionMode } from "../../DataStructure/Mode";
import { Point } from "../../DataStructure/Point";
export function LineCard({
  line,
  setData,
  data,
  showConfirmation,
  functionMode,
  setFunctionMode,
  insertInfo,
  setInsertInfo,
  menuRef,
  cardShowing,
  setCardShowing,
}: {
  line: LineProps;
  setData: Dispatch<SetStateAction<UserDataType>>;
  data: UserDataType;
  showConfirmation?: showConfirmationInterface;
  functionMode: FunctionMode;
  setFunctionMode: React.Dispatch<React.SetStateAction<FunctionMode>>;
  insertInfo?: InsertInfo;
  setInsertInfo: React.Dispatch<React.SetStateAction<InsertInfo | undefined>>;
  menuRef: RefObject<any>;
  cardShowing: CardShowing;
  setCardShowing: Dispatch<SetStateAction<CardShowing>>;
}) {
  const {
    lineId,
    lineName,
    stationIds,
    sign,
    order,
    color: colorSelected,
    subLine = false,
  } = line;
  const {
    getStationById,
    getStationsInThisLine,
    setLineName,
    setSign,
    setOrder,
    setColor,
    getBendFirst,
    setBendFirst,
    deleteLine,
    setSubLine,
  } = dataProcessor(lineId, setData, data);
  const colorName = colorSHMap.get(colorSelected)?.color_name || colorSelected;
  const firstStation = getStationById(stationIds[0]);
  const lastStation = getStationById(stationIds[stationIds.length - 1]);
  // if (!firstStation) {
  //   firstStation = new StationProps();
  //   lastStation = firstStation;
  // }
  const [expand, setExpand] = useState(false);
  const [edit, setEdit] = useState(false);
  const [expandWidth, setExpandWidth] = useState(455);
  const [tab, setTab] = useState("name");
  const addingStation =
    functionMode === FunctionMode.selectingStation ||
    functionMode === FunctionMode.lineEditing ||
    !firstStation;
  const getExpandWidth = () => {
    const { stationIds: stations } = cardShowing;
    const expected =
      33 + 161 * (addingStation ? stationIds.length + 1 : stationIds.length);
    const hasStation = stations && stations.length;

    const width =
      expected > window.innerWidth
        ? window.innerWidth - (hasStation ? 505 : 100)
        : expected;
    // console.log(width);
    setExpandWidth(width);
  };
  useEffect(() => {
    getExpandWidth();
    window.addEventListener("resize", getExpandWidth);
    return () => window.removeEventListener("resize", getExpandWidth);
  }, [stationIds, addingStation, cardShowing]);
  useEffect(() => {
    getExpandWidth();
  }, [expand]);
  const editTools = (tab: string) => {
    switch (tab) {
      case "name": {
        return (
          <div className="name-detail" onWheel={onWheelX}>
            <div className="name-item sign">
              <div className="title" style={{ color: colorSelected }}>
                标识
              </div>

              <AutoGrowthInput
                className="sign-input"
                value={sign}
                onInput={(e) => setSign(e.currentTarget.value)}
                style={{ backgroundColor: colorSelected }}
              />
            </div>
            <div className="name-item line-name-item">
              <div className="title" style={{ color: colorSelected }}>
                名称
              </div>
              <AutoGrowthInput
                onInput={(e) => setLineName(e.currentTarget.value)}
                className="line-name-input"
                value={lineName}
              />
            </div>
            <div className="name-item order">
              <div className="title" style={{ color: colorSelected }}>
                排序
              </div>

              <AutoGrowthInput
                className="order-input"
                value={order}
                type="number"
                onInput={(e) => setOrder(parseInt(e.currentTarget.value))}
              />
            </div>
          </div>
        );
      }
      case "color": {
        return (
          <div className="color-detail">
            <div className="color-detail-choosing">
              {new Array(10).fill(1).map((x, index) => {
                const { color } = colorSH[index];
                const choosed = color === colorSelected;

                return (
                  <div
                    className={classNames({
                      "color-preview": 1,
                      "color-selected": choosed,
                    })}
                    style={{
                      borderColor: color,
                      backgroundColor: choosed ? "inherit" : color,
                    }}
                    onClick={() => setColor(color)}
                  >
                    <div
                      className="color-preview-inner"
                      style={{ backgroundColor: color }}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="custom-color">
              <div className="selected-color-preview">
                <input
                  className="color-input"
                  type="color"
                  value={colorSelected}
                  onInput={(e) => setColor(e.currentTarget.value)}
                />
                <input
                  className="color-value"
                  value={colorSelected}
                  onInput={(e) => setColor(e.currentTarget.value)}
                ></input>
              </div>
            </div>
          </div>
        );
      }
      case "operation": {
        return (
          <div className="operation-detail">
            <div
              className="operation-item"
              onClick={() => {
                setSubLine(!subLine);
              }}
            >
              {subLine?'不再作为':'设为'}支线...
            </div>
            <div
              className="operation-item delete"
              onClick={() => {
                showConfirmation!({ line }, deleteLine);
              }}
            >
              删除线路...
            </div>
          </div>
        );
      }
    }
  };
  const { engine } = browserInfo;
  const stationsInThisLine = getStationsInThisLine();
  if (addingStation) {
    stationsInThisLine.unshift(new StationProps());
  }
  return (
    <div
      className={classNames({ "line-card": 1, "expand-card": expand })}
      style={{
        width: expand ? expandWidth : undefined,
        boxShadow:
          engine.name === "WebKit"
            ? "0 4px 59px 7px rgba(0, 0, 0, 0.25)"
            : undefined,
      }}
    >
      <div className="tools">
        {expand || edit ? (
          <></>
        ) : (
          <div
            className="edit tool-item"
            onClick={() => {
              setEdit(true);
              // setTab("name");
            }}
          >
            <EditIcon className="edit-icon"></EditIcon>
          </div>
        )}
        {edit ? (
          <></>
        ) : (
          <div className={classNames({"expand tool-item":1,shrink: expand})} onClick={() => setExpand(!expand)}>
            {expand ? <ShrinkIcon className="expand-icon"/> : <ExpandIcon className="expand-icon"/>}
          </div>
        )}
      </div>
      <div
        className="stations-count"
        onClick={() => {
          setCardShowing({ lineIds: [lineId], stationIds });
        }}
      >
        {stationIds.length}个站点
      </div>

      <AutoGrowthInput
        onInput={(e) => setLineName(e.currentTarget.value)}
        className="line-name"
        value={lineName}
        disabled
      />
      {edit ? (
        <div className="edit-detail">{editTools(tab)}</div>
      ) : (
        <>
          <div className="from-to">
            {firstStation
              ? `从${firstStation!.stationName}开往${lastStation!.stationName}`
              : "尚未开通"}
          </div>

          <div
            className="station-bar"
            style={expand ? { width: expandWidth } : {}}
            onWheel={onWheelX}
          >
            <div className="add-first"></div>
            {stationsInThisLine.map((station, index) => {
              const { stationName, stationId } = station!;
              const bendFirst = getBendFirst(index);
              const last = index === stationsInThisLine.length - 1;
              let currentInserting = false;
              if (insertInfo) {
                const { insertIndex, line: insertLine } = insertInfo;
                if (insertIndex === index && insertLine === line) {
                  currentInserting = true;
                }
              }
              return (
                <div className="station-block">
                  <div className="track">
                    <div className="sleeper"></div>
                    <div className="sleeper"></div>
                    <div className="sleeper"></div>
                  </div>
                  <div
                    className={classNames({
                      "bend-first": 1,
                      "current-inserting": currentInserting,
                    })}
                    onClick={(e) => {
                      if (addingStation) {
                        if (!firstStation) {
                          if (menuRef?.current?.showTools) {
                            menuRef.current.showTools(
                              e,
                              FunctionMode.selectingStation
                            );
                          }
                        }
                        setInsertInfo({ insertIndex: index, line });
                        setFunctionMode(FunctionMode.selectingStation);
                      } else if (last) {
                        setInsertInfo({ insertIndex: index + 1, line });
                        if (menuRef?.current?.showTools) {
                          menuRef.current.showTools(
                            e,
                            FunctionMode.selectingStation
                          );
                        }
                      } else {
                        setBendFirst(index, !bendFirst);
                      }
                    }}
                  >
                    <div
                      className={classNames({
                        "bend-icon": 1,
                        bend: bendFirst && !addingStation && !last,
                      })}
                    >
                      {addingStation || last ? <PlusIcon /> : <ArrowIcon />}
                    </div>
                    <div className="bend-des">
                      {addingStation || last
                        ? currentInserting
                          ? "插入到这"
                          : "插入站点"
                        : bendFirst
                        ? "斜向优先"
                        : "直线优先"}
                    </div>
                  </div>
                  <div
                    className="station-name"
                    style={{ color: colorSelected }}
                    onClick={() => {
                      setCardShowing({
                        lineIds: [lineId],
                        stationIds: [stationId],
                      });
                    }}
                  >
                    {stationName}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {
        <div className={classNames({ "edit-panel": 1, edit })}>
          <div
            className={classNames({
              "edit-tools": 1,
            })}
            onWheel={onWheelY}
          >
            <div
              className={classNames({
                "edit-tool name": 1,
                selected: tab === "name",
              })}
              onClick={(e) => {
                scrollOptimize(e);
                setTab("name");
              }}
            >
              <div className="title">名称</div>
              <div className="value">1号线</div>
            </div>
            <div
              className={classNames({
                "edit-tool color": 1,
                selected: tab === "color",
              })}
              onClick={(e) => {
                scrollOptimize(e);
                setTab("color");
              }}
            >
              <div className="title">颜色</div>
              <div className="value" style={{ color: colorSelected }}>
                {colorName}
              </div>
            </div>
            <div
              className={classNames({
                "edit-tool operation": 1,
                selected: tab === "operation",
              })}
              onClick={(e) => {
                scrollOptimize(e);
                setTab("operation");
              }}
            >
              <div className="title">操作</div>
              <div className="value">删除</div>
            </div>
          </div>

          <div className="done" onClick={() => setEdit(false)}>
            <EditIcon className="done-icon" />
            <span className="done-des">完成</span>
          </div>
        </div>
      }
    </div>
  );
}
