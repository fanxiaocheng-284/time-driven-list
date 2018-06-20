# time-driven-list

## Install

```bash
$ npm install time-driven-list
```	

#### Usage

```js
import TimeList from 'time-driven-list';

/**
 * Init the list
 */

const timeList = new TimeList({
  needReplay: true, // Controlling whether the event is abandoned after execution.
});

/**
 * Add event
 */
timeList.on({
  callBack: () => {
    console.log('list item 1 done');
  },
  time: 1000, // ms
  needTodo: true,
});

timeList.on({
  callBack: () => {
    console.log('list item 2 done');
  },
  time: 1500, // ms
});

/**
 * Trigger event
 */

// three params, currentTime, deviationTime and custom role edit the qualified list.

timeList.triggerByLimit(1200, 500);
// 'list item 1 done'
// 'list item 2 done'

timeList.triggerByLimit(800, 500, list => list.slice(-1));
// 'list item 1 done'

timeList.triggerByLimit(1200, 500, list => list.slice(-1));
// 'list item 2 done'

timeList.triggerByLimit(1200, 500, list => []);
// none

timeList.triggerByLimit(1200, 500, list => {
  const result = [];
  list.map((item) => {
    if (item.needTodo) {
      result.push(item)
    }
  });
  return result;
});
// 'list item 1 done'

```

### Contact

Author: Jack sirens

E-mail: fanxiaocheng@howzhi.com