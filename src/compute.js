const Compute = {
  cloneObj(obj) {
    if (obj && typeof obj === 'object') {
      let str = null;
      let newobj = null;
      str = JSON.stringify(obj);
      newobj = JSON.parse(str);
      return newobj;
    }
    return false;
  },
  removeFromList(list, value) {
    if (Array.isArray(list) && list.length >= 0) {
      if (list.indexOf(value) >= 0) {
        list.splice(list.indexOf(value), 1);
        return list;
      }
      return false;
    }
    return false;
  },
  setList(list, value) {
    if (Array.isArray(list) && list.length >= 0) {
      if (list.indexOf(value) >= 0) {
        return list.indexOf(value) + 1;
      }
      if (!list.length) {
        list.push(value);
        return 1;
      }
      for (let i = 0; i < list.length; i += 1) {
        if (list[i] > value) {
          list.splice(i, 0, value);
          return i + 1;
        } else if (i === list.length - 1) {
          list.push(value);
          return i + 1;
        }
      }
    }
    return 0;
  },
  // sortList(list, newList) {
  //   const resultList = [];
  //   let listIndex = 0;
  //   let newListIndex = 0;
  //   const TRUE = true;
  //   while (TRUE) {
  //     if (listIndex === list.length) {
  //       return resultList.concat(newList.slice(newListIndex));
  //     } else if (newListIndex === newList.length) {
  //       return resultList.concat(list.slice(listIndex));
  //     }
  //     if (list[listIndex] >= newList[newListIndex]) {
  //       resultList.push(newList[newListIndex]);
  //       newListIndex += 1;
  //     } else {
  //       resultList.push(list[listIndex]);
  //       listIndex += 1;
  //     }
  //     if ((listIndex === list.length) && (newListIndex === newList.length)) {
  //       return resultList;
  //     }
  //   }
  // },
};

export default Compute;
