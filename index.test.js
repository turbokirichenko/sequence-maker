const generator = require('./index.js');

const tq = (type, value) => { if (typeof value != type) throw new Error ('Error: type validation!'); }
const eq = (v, ...p) => { 
	let once = false;
	let all = true;
	const pattern = [...p];
	for (let i = 0; i < pattern.length; ++i) {
		if (pattern[i] === v) once = true;
		else all = false;
	}
	if (!once) throw new Error ('Error: value and pattern not match!');
}

//testing
describe('sequence tests', () => {
	it('simple example', () => {
		//create simple sequence
		const sequences = new generator({ probability: 0.3 }); // config object
		const result = sequences.make({
			odd: { // custom config params
				type: Boolean, //type of item
				need: true //required
			}
		}, 10); //size of sequence
		
		//checking
		tq("boolean", result[0].odd);
		eq(10, result.length);
	});
	it('object from object', () => {
		//create sequence
		const sequences = new generator({});
		const result = sequences.make({
			parent: {
				name: String, //random String
				child: {
					name: "Biba", //constant value
				}
			}
			
		}, [1, 3]); //size range: from 1 to 3
		

		//checking
		const testObj = result[0];
		tq("object", testObj.parent);
		tq("string", testObj.parent.name);
		eq("Biba", testObj.parent.child.name);
	});
	it ('create  array', () => {
		//create sequence to object
		const sequences = new generator(); // config todo array's size
		const result = sequences.make({
			todo: [{
				text: "Read the book tonigth",
				completed: {
					type: Boolean,
					need: false, // not required
					chance: 0.1, // propability of gen number
				},
				date: Date.now()
			}]
		}, 3); //size of array
		
		//checking
		tq("object", result[0].todo);
		eq("Read the book tonigth", result[0].todo[0].text);
		eq(result[0].todo.length, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
	});
	it('custom type', () => {
		//custom type function
		function User(opts) { // must be opts param
			return 'id.prefix : '
				+ opts.objectId()
				+ '\nUser id: ' 
				+ opts.id() // getter!
				+ '\nHead id: ' 
				+ opts.head({string : "12345"});
		}
		//custom getter
		function Head(params) {//opts object
			return 'head of user: ' + params.string; // expect: 12345
		}
		//create sequence to object
		const sequences = new  generator({});
		const result = sequences.make({ //schema object
			id: {
				prefix: String,
				nonce: {
					type: Number,
					min: 0,
					max: 9999,
				},
			},
			user: {
				type: User, // set custom type
				id: String, // set id to opts
				head: Head, // set function to opts
				objectId: sequences.Linker("id.prefix"), //set link on place "schema.name"
			},
			copy: sequences.Linker("user.name") //undefined, because "user.name" - is parameter for getter Home
		}, 5);

		//checking
		eq(5, result.length);
		tq("string", result[0].user);
		tq("number", result[0].id.nonce);
	});
	it('Linker type', () => {
		const sequences = new generator({});
		const Linker = sequences.Linker;
		const result = sequences.make({
			nick: {
				name: {
					firstName: String,
					lastName: String
				},
				id: String,
			},
			info: {
				linkToName: Linker("nick.name.firstName"),
				linkToId: Linker("nick.id"),
			},
		}, [1, 4]);
		
		const obj = result[0];
		//check
		eq(obj.nick.name.firstName, obj.info.linkToName);
		eq(obj.nick.id, obj.info.linkToId);
	});
	it('RandomValueFromList type', () => {
		const sequences = new generator({});
		const List = sequences.List;
		const result = sequences.make({
			unit: {
				id: String,
				race: List(["Orc", "Dwarf", "Human", "Elf", "Unicorn"]),
			}
		}, [1, 4]);
		
		const obj = result[0];
		//check
		eq(obj.unit.race, "Orc", "Dwarf", "Human", "Elf", "Unicorn");
	});
	it('type Error', () => {
		const sequences = new generator({});
		
		const errorExample = sequences.make({ //returned sequence of strings
			type: String,
			name: String, // name as parameter for type: String
		}, 4);

		const correctExample = sequences.make({
			type: {
				type: String,
			},
			name: String, // name as key from object
		}, 4)
		const obj = correctExample[0];
		tq("string", errorExample[0]);
		tq("string", obj.name);
	})
})
