---
title: 【数据结构学习】单链表在JavaScript中的实现
date: 2021-05-07 18:42:58
tags: 数据结构
---

### 什么是链表
链表是一种物理存储单元上非连续、非顺序的存储结构，数据元素的逻辑顺序是通过链表中的指针链接次序实现的。链表由一系列结点（链表中每一个元素称为结点）组成，结点可以在运行时动态生成。每个结点包括两个部分：一个是存储数据元素的数据域，另一个是存储下一个结点地址的指针域。

### 链表和数组特点的比较

数组：
+ 数组静态分配内存，大小固定
+ 在数组中添加或移除项的成本较高，因为数组的内存地址是连续的，需要移动元素。时间复杂度O(n)
+ 通过下标可随机访问元素，数据查找效率较高（内存连续）。时间复杂度O(1)

链表：
+ 链表动态分配内存，扩展性好
+ 在链表中添加或移除元素效率较高，不需要移动其它元素。时间复杂度O(1)。
+ 查找效率较慢，访问一个元素，需从起点迭代直到找到所需的元素。时间复杂度O(n)

<!--more-->
在JavaScript中，链表的结构如下，每个元素包含2个属性，其中val为链表元素的值，next则是指向链表中下一个元素的指针。
```javascript
const list = {
    head: {
        val: 6
        next: {
            val: 10                                             
            next: {
                val: 12
                next: {
                    val: 3
                    next: null	
                    }
                }
            }
        }
    }
};
```
![image](/img/articleimg/linkedlist.png)

实现链表的几个主要方法：
+ `push(val)`:向链表尾部添加一个新元素
+ `insert(val,position)`:向链表特定位置插入一个新元素。
+ `getElementAt(position)`:返回链表中特定位置的元素。
+ `remove(val)`:从链表中移除一个元素。
+ `indexOf(val)`:返回元素在链表中的索引。
+ `removeAt(position)`:从链表的特定位置移除一个元素。
+ `replaceAt(val,position)`:替换链表中特定位置的元素。
+ `reverse()`:反转链表。
+ `clear()`:清空链表。
+ `size()`:返回链表长度。
+ `toString()`:返回整个链表的字符串。


```javascript
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;//头结点
        this.count = 0;//链表长度
    }
    /**
     * @param val 插入末端的值
     * 第一种情况，head为空，直接将元素赋值给head
     * 第二种情况，循环遍历取到最后一个元素，将新增的元素接上即可
     */
    push(val) {
        const node = new ListNode(val);
        let current = this.head;
        if (current == null) {
            this.head = node;
        } else {
            while (current.next != null) {
                current = current.next;
            }
            current.next = node;
        }
        this.count++;
    }
    /**
     * @param index 元素的位置
     * @return 该位置的元素
     */
    getElementAt(index) {
        if (index >= 0 && index < this.count) {
            let current = this.head;
            for (let i = 0; i < index && current.next != null; i++) {
                current = current.next;
            }
            return current
        }
        return undefined
    }
    /**
     * @description 删除index位置上的元素
     * @param index 元素的位置
     * @return 该位置的元素的val
     */
    removeAt(index) {
        if (index >= 0 && index < this.count) {
            let current = this.head;
            if (index == 0) {
                this.head = current.next;
            } else {
                const previous = this.getElementAt(index - 1);
                current = previous.next;
                previous.next = current.next;
            }
            this.count--;
            return current.val;
        }
        return undefined
    }
    /**
     * @description 删除值为val的元素
     */
    remove(val){
        let index = this.indexOf(val);
        return this.removeAt(index)
    }
    /**
     * @description 在index位置插入元素
     * @param val 插入到index位置的值
     * @param index 元素的位置
     * @return {Boolean} 表示成功或失败
     */
    insertAt(val, index) {
        if (index >= 0 && index < this.count) {
            const node = new ListNode(val);
            let current = this.head;
            if (index == 0) {
                node.next = current;
                this.head = node;
            } else {
                const previous = this.getElementAt(index - 1);
                current = previous.next;
                node.next = current;
                previous.next = node;
            }
            this.count++;
            return true
        }
        return false
    }
    /**
     * @description 替换index位置元素的值
     * @param val 新的值
     * @param index 元素的位置
     * @return {Boolean} 表示成功或失败
     */
    replaceAt(val, index) {
        if (index >= 0 && index < this.count) {
            let current = this.head;
            if (index > 0) {
                current = this.getElementAt(index);
            }
            current.val = val;
            return true
        }
        return false
    }
    /**
     * @description 查找元素的位置
     * @param val 元素的值
     * @return {Number} index
     */
    indexOf(val) {
        let current = this.head;
        for (let i = 0; i < this.count && current != null; i++) {
            if(current.val === val){
                return i
            }
            current = current.next;
        }
        return -1
    }
    /**
     * @description 链表反转
     */
    reverse() {
        let current = this.head;
        let previous = null;
        let next = null;
        while (current != null) {
            next = current.next;
            current.next = previous;
            previous = current;
            current = next;
        }
        this.head = previous;
        return this.head
    }
    /**
     * @description 把链表对象转化成字符串
     * @return {String} 返回链表内容的字符串 e.g 1,2,3,4
     */
    toString() {
        let current = this.head;
        if (current == null) {
            return ''
        }
        let objString = current.val;
        while (current.next != null) {
            objString = `${objString},${current.next.val}`;
            current = current.next;
        }
        return objString
    }
    /**
     * @return {Number} 链表长度
     */
    size() {
        return this.count
    }
}

let list = new LinkedList()

list.push(1)
list.push(3)
list.push(5)
list.push(7)

list.insertAt(9, 0) 
list.remove(7)

console.log('list.indexOf(3) => ', list.indexOf(3)); //1
console.log('list.toString() => ', list.toString()); //"9,1,3,5"

list.reverse() //5->3->1->9

console.log(list)
```

### 参考资料
1、How to Implement a Linked List in JavaScript
https://www.freecodecamp.org/news/implementing-a-linked-list-in-javascript/
2、Linked Lists for JavaScript Developers
https://daveceddia.com/linked-lists-javascript/
3、Implementation of LinkedList in Javascript
https://www.geeksforgeeks.org/implementation-linkedlist-javascript/
4、《学习JavaScript数据结构与算法》

### 算法题目
#### 寻找链表的中间结点
> 给定一个头结点为 head 的非空单链表，返回链表的中间结点。如果有两个中间结点，则返回第二个中间结点。
```javascript
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
const middleNode = function(head) {
    if (head == null || head.next == null) {
        return head
    }
    let slow = head;
    let fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow
};
```
思路：快慢指针（双指针），快指针每次走2步，慢指针每次走1步，当快指针走到末尾的时候，慢指针刚好走到中间。


#### 删除链表的倒数第n个节点
> 给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。要求使用一趟扫描实现。
```javascript
const removeNthFromEnd = function(head, n) {
    let preNode = head;
    let curNode = head;
    for (let i = 0; i < n; i++) {
        curNode = curNode.next;
    }
    if (curNode == null) {
        return preNode.next;
    }
    while (curNode.next != null) {
        preNode = preNode.next;
        curNode = curNode.next;
    }
    preNode.next = preNode.next.next;

    return head;
};
```
思路：双指针，和上题思路差不多。`curNode`指针先走n步，再和`preNode`一起走，当`curNode`走到最后的时候，`preNode`所在的位置为要删除节点的前驱。此种写法虽然是有2个循环，但实际上合起来也只是遍历链表一次而已。