# Sequence Maker
### Professional tool for generating random sequences.
### Use in your project tests.
---
![alt text](https://img.shields.io/github/repo-size/turbokirichenko/sequence-maker?style=for-the-badge)
![alt text](https://img.shields.io/github/package-json/v/turbokirichenko/sequence-maker?style=for-the-badge)
---
## Getting Started
```
$ npm i sequence-maker --save-dev

```
## Creating sequence maker
```js

const sequenceMaker = require('sequence-maker');

//create sequenceMaker
const sequence = new sequenceMaker();
```

## Simple example
```js

//simple: generates Random level
const simpleExample = sequence.make(
	{
		head: "Level of Unit", // constant phrase
		level: { // set type
			type: Number, // random Number
			min: 0, // min value (not required)
			max: 999, // max value (not required)
		}
	}, 
	3 // SIZE OF SEQUENCE
);

console.log(simpleExample);

/* console something like this:

[ 
	{ 
		head: "Level of Unit",
		level: 968 
	}, 
	{ 
		head: "Level of Unit",
		level: 941 
	}, 
	{ 
		head: "Level of Unit",
		level: 736 
	} 
]

*/

```

## Commonly example
```js
//medium: Object from object
const mediumExample = sequence.make(
	{
		parent: { // parent
			name: String, // set type without opts
			child: { // child
				name: { // set type with custom opts
					type: String, 
					len: 5, // length of random string
				}
			}
		}
	},
	2
);

console.log(mediumExample);

/* console something like this:

[
  {
    parent: { 
    	name: 'a5039030e01c54ef48f411bda6e0661d', 
    	child: {
    		name: 'f45e1'
    	} 
    }
  },
  {
    parent: { 
    	name: '0bb040de3523d9e621e26631d42c9851', 
    	child: {
    		name: 'bc012'
    	}
    }
  }
]

*/

```

## Array

```js
//create array from object
const createArray = sequence.make(
	{
		todo: [{
			text: "don't call your ex!!!",
			faled: {
				type: Boolean,
				prob: 0.99 // the probability of value: "true"
			}
		}]
	},
	2
);

console.log(createArray);

/* console something like this:

[
	{
		todo: [
			{ text: "don't call your ex!!!", failed: true },
			{ text: "don't call your ex!!!", failed: true },
			{ text: "don't call your ex!!!", failed: false },
			{ text: "don't call your ex!!!", failed: true },
		]
	},
	{
		todo: [
			{ text: "don't call your ex!!!", failed: true },
			{ text: "don't call your ex!!!", failed: true },
		]
	}
]

*/

```

## Extremely example
```js
//extreme: Using: 'Linker', 'List', 'UniqueList'
const Linker = sequenceMaker.Linker; // copy value from object
const List = sequenceMaker.List; // random value taken from list (MATCHES IS POSSIBLE)
const UniqueList = sequenceMaker.UniqueList; // random value taken from list (MATCHES EXCLUDED)

const extremeExample = sequence.make(
	{
		unit: {
			name: UniqueList(["Theodor", "Immanuil", "Pheodor", "Sophia"]), // set type
			race: List(["Human", "Orc", "Elf", "Dwarf", "Unicorn"]), // set type
		},
		copy_name: Linker("unit.name"), // copy value from <this-obj>.unit.name
	},
	2
);

console.log(extremeExample);

/* console something like this:

[
  { unit: { name: 'Theodor', race: 'Unicorn' }, copy_name: 'Theodor' },
  { unit: { name: 'Pheodor', race: 'Dwarf' }, copy_name: 'Pheodor' }
]

*/

```
---

## You can create custom types!

```js
//bonus: Create custom type
const MyCustomType = (opts) => { // opts: required
	const string = opts.string() // opts.<value> - is getter!!!
	
	return "This is a bad password: " + string;
}

const customTypesObjs = sequence.make(
	{
		log: {
			type: MyCustomType, // set your custom type
			string: {
				type: String,
				len: 3,
			}
		}
	},
	13
)

console.log(customTypesObjs);

//WOW!
/* console something like this:
[
  { log: 'This is a bad password: 077' },
  { log: 'This is a bad password: 7a8' },
  { log: 'This is a bad password: f45' },
  { log: 'This is a bad password: a4c' },
  { log: 'This is a bad password: c3d' },
  { log: 'This is a bad password: cf9' },
  { log: 'This is a bad password: 7d0' },
  { log: 'This is a bad password: 930' },
  { log: 'This is a bad password: e28' },
  { log: 'This is a bad password: 351' },
  { log: 'This is a bad password: 115' },
  { log: 'This is a bad password: 101' },
  { log: 'This is a bad password: 5d5' }
]

*/
```

## Write data to file
```js
//write schema to file by write method
sequence.write(
	{
		/* schema ... */
	},
	555, /* size of sequence */
	'myFile.json' /* file name */
)
```

## Changing default config

### sequence-maker/config.json

---

## More Examples ...

### [docs](https://github.com/turbokirichenko/sequel/blob/main/index.test.js)
