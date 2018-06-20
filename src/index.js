import Compute from './compute';
import WaittingExecut from 'waitting-execut';

class TimeList {
  constructor(options = {}) {
    this.timeList = [];
    this.eventList = {};
    this.wattingList = {};
    this.checkPointList = [];
    this.currentList = [];
    this.doingList = [];
    this.lastIndex = 0;
    this.totalList = {
      timeList: [],
      eventList: {},
    };
    this.options = options || {};
    this.needReplay = options.needReplay;
  }

  on(event) {
    this.setTimeList(Number(event.time));
    if (!this.eventList[Number(event.time)]) {
      this.eventList[Number(event.time)] = [event];
    } else {
      this.eventList[Number(event.time)].push(event);
    }

    if (event.checkPoint) {
      Compute.setList(this.checkPointList, Number(event.time));
    }

    if (this.currentTime) {
      this.triggerByLimit(this.currentTime);
    }
  }

  setTimeList(time) {
    Compute.setList(this.timeList, time);
  }

  setTotalList(event) {
    Compute.setList(this.totalList.timeList, Number(event.time));

    if (!this.totalList.eventList[Number(event.time)]) {
      this.totalList.eventList[Number(event.time)] = [event.callBack];
    } else {
      this.totalList.eventList[Number(event.time)].push(event.callBack);
    }
  }

  uploadCurrentTime(time) {
    this.currentTime = time;
  }

  getNearestCheckPointIndex(time) {
    if (!this.checkPointList.length) {
      return 0;
    }
    const pointCurrentList = Compute.cloneObj(this.checkPointList);
    return Compute.setList(pointCurrentList, time);
  }

  getTimeIndex(time) {
    const timeCurrentList = Compute.cloneObj(this.timeList);
    const eventIndex = Compute.setList(timeCurrentList, time);
    let currentIndex = this.options.needReplay ? this.lastIndex : 0;
    if (eventIndex < currentIndex) {
      currentIndex = 0;
    }
    if (eventIndex >= 0) {
      // if (this.getNearestCheckPointIndex(time) > 0 && (this.options.checkPointCallBack && typeof this.options.checkPointCallBack === 'function')) {
      //   this.options.checkPointCallBack();
      // }
      return {
        index: eventIndex,
        list: timeCurrentList.slice(currentIndex, eventIndex - 1),
      };
    }
    return {
      index: 0,
      list: [],
    };
  }

  triggerByLimit(time, limit = 0, customRule) {
    // promise未完全执行
    console.log(this.currentList.length);
    if (this.currentList.length) {
      return;
    }

    // 获取当前符合信息队列
    const currentTrigger = this.getTimeIndex(time + limit);
    console.log('currentTrigger', time, currentTrigger);
    if (this.options.needReplay) {
      this.lastIndex = currentTrigger.index;
    }
    if (!currentTrigger.index) {
      return;
    }
    let resultList = [];
    currentTrigger.list.map((value) => {
      // this.triggerByTime(value, time);
      resultList = resultList.concat(this.eventList[value]);
    });
    if (customRule) {
      resultList = customRule(resultList);
    }
    console.log('replay resultList', resultList);
    resultList.map((value) => {
      this.triggerByItem(value, time);
    });
    console.log('replay this.doingList', this.doingList);
    if (this.doingList.length) {
      Promise.all(this.doingList).then(() => {
        if (!this.options.needReplay) {
          this.finishedTrigger(this.currentList);
        }
        this.doingList = [];
        this.currentList = [];
      });
    }
  }

  triggerByItem(item, triggerTime) {
    const time = item.time;
    console.log('replay time', time, triggerTime);
    this.currentList.push({
      time,
      item,
    });
    const itemPromise = new Promise((resolve) => {
      const triggerItem = new WaittingExecut({
        waitTime: time - triggerTime,
        callBack: () => {
          console.log('replay callBack', item.data);
          item.callBack();
          this.clearTriggerItem(time, item);
          resolve();
        },
      });
      if (!this.wattingList[time]) {
        this.wattingList[time] = [triggerItem];
      } else {
        this.wattingList[time].push(triggerItem);
      }
    }).then(() => {
      console.log('replay done', item);
    }).catch((e) => {
      console.warn(e);
    });
    this.doingList.push(itemPromise);
  }

  triggerByTime(time, triggerTime) {
    if (this.eventList[time]) {
      this.eventList[time].map((value) => {
        this.currentList.push({
          time,
          value,
        });
        const itemPromise = new Promise((resolve) => {
          const triggerItem = new WaittingExecut({
            waitTime: time - triggerTime,
            callBack: () => {
              value.callBack();
              this.clearTriggerItem(time, value);
              resolve();
            },
          });
          if (!this.wattingList[time]) {
            this.wattingList[time] = [triggerItem];
          } else {
            this.wattingList[time].push(triggerItem);
          }
        });
        this.doingList.push(itemPromise);
      });
    }
  }

  finishedTrigger(list) {
    list.map(({ time, value }) => {
      Compute.removeFromList(this.eventList[time], value);
      if (!this.eventList[time].length) {
        Compute.removeFromList(this.timeList, time);
      }
    });
  }

  clearTriggerItem(time, value) {
    Compute.removeFromList(this.wattingList[time], value);
  }

  resetListByTotal() {
    this.waittingCancel();
    this.eventList = Compute.cloneObj(this.totalList.eventList);
    this.timeList = [...this.totalList.timeList];
  }

  playBackByLimit(time) {
    this.resetListByTotal();
    this.triggerByLimit(time);
  }

  waittingCancel() {
    Object.keys(this.wattingList).map((time) => {
      const item = this.wattingList[time];
      item.map((value) => {
        value.abort();
        this.on({
          time,
          callBack: value,
        });
      });
    });
  }

  waittingFinish() {
    Object.keys(this.wattingList).map((time) => {
      const item = this.wattingList[time];
      item.map((value) => {
        value.execut();
      });
    });
  }

  finishList() {
    this.timeList.map((value) => {
      this.triggerByTime(value);
    });
    this.waittingFinish();
  }
}

export default TimeList;
