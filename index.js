const fs = require('fs');
const config = require('./config.json');
function sequenceGenerator () {
	//
	this.schema = {};
	//
	let Schema = {};
	let Context = {};
	let Props = {};
	//
	this.clone = Clone;
	this.go = GoPath;
	this.make = Make;
	//types
	this.Linker = Linker;
	this.List = RandomValueFromList;
	this.UniqueList = UniqueRandomValueFromList;
	this.RandomString = RandomStringType;
	this.RandomNumber = RandomNumberType;
	this.RandomBoolean = RandomBooleanType;

	const tq = (type, value) => {
		if (typeof value != type) throw new Error ('syntax Error: get wrong type');
		return true;
	}
	const eq = (type, value) =>
		typeof value === type;

	//deep copy schema object
	function Clone (schema) {
		if (typeof schema != "object") return schema;
		let storage = Array.isArray(schema)? [] : {};
		for (key in schema) {
			const cKey = key;
			if (typeof schema[cKey] === "function") {
				storage[cKey] = schema[cKey];
				continue;
			}
			if (typeof schema[cKey] === "object") {
				if (Array.isArray(schema[cKey])) {
					storage[cKey] = [];
					for (let i = 0; i < schema[cKey]. length; ++i) {
						storage[cKey].push(Clone(schema[cKey][i]));
					}
				} else {
					storage[cKey] = Clone(schema[cKey]);
				}
			} else {
				storage[key] = schema[key];
			}
		}
		return storage;
	}
	// search the refer from context
	function GoPath (ref) {
		//get context
		let ctx = Context;
		//pieces of path
		const pieces = ref.split('.');
		const size = pieces.length;
		for (let i = 0; i < size; ++i) {
			ctx = ctx[pieces[i]];
			if (typeof ctx != "object") // path too long
				return undefined; 
		}
		return ctx;
	}
	//TYPES
	//link to object
	function Linker (refString) {
		return __link$ = (props) => {
			return GoPath(refString); //get object by link
		}
	}
	//value from list
	function RandomValueFromList (l) {
		const list = Array.isArray(l) ? l : false;
		if (!list) throw new Error ('argument from function: List must be Array!');
		return RandomValue = (props = {}) => {
			const size = list.length;
			const num = Math.floor(Math.random() * size);
			return list[num];
		}
	}
	//gen unique value
	function UniqueRandomValueFromList (l) {
		const list = Array.isArray(l) ? l : false; 
		if (!list) throw new Error ('argument from function: List must be Array!');
		list.sort((a,b) => Math.random()*10 - Math.random()*10);
		let randomList = list.filter((v) => v);
		return NextValue = (props = {}) => {
			let next = null;
			for (k in randomList) {
				if (randomList[k]) {
					next = randomList[k];
					delete randomList[k];
					break;
				}
			}
			return next;
		}
	}
	//random string generator
	function RandomStringType (alphabet = "") {
		//
		const random = (length) => {
		    let chars = alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		    let str = '';
		    for (let i = 0; i < length; i++) 
		    	str += chars.charAt(Math.floor(Math.random() * chars.length));
		    return str;
		};
		return (props = {}) => {
			this.props = Props;
			const len =  eq("function", props.len) ? props.len() : (config.default_length || 65536);
			const need = eq("function", props.need) ? props.need() : (config.needs || false);
			const chance = eq("function", props.chance) ? props.chance() : (config.chance || 0.5);
			tq("number", len);
			tq("boolean", need);
			tq("number", chance);
			//
			const print = chance - Math.random();
			return (need || print > 0) ? String(random(len)) : null;
		};
	}
	//
	function RandomNumberType () {
		//
		const random = (maxN, minN, integer) => {
			const r = Math.random()*(maxN - minN) + minN;
		    return integer ? Math.floor(r) : r;
		};
		//
		return (props = {}) => {
			this.props = Props;
			const max = eq("function", props.max) ? props.max() : (config.maxNumber || 65536);
			const min =  eq("function", props.min) ? props.min() : (config.minNumber || 0);
			const int = eq("function", props.int) ? props.int() : (config.integer || true);
			const need = eq("function", props.need) ? props.need() : (config.needs || false);
			const chance = eq("function", props.chance) ? props.chance() : (config.chance || 0.5);
			tq("number", max);
			tq("number", min);
			tq("boolean", int);
			tq("boolean", need);
			tq("number", chance);
			//
			const print = chance - Math.random();
			return (need || print > 0) ? Number(random(max, min, int)) : null;
		};
	}
	//
	function RandomBooleanType () {
		//
		const random = (prob) =>
		    (prob - Math.random() > 0);
		//
		return (props = {}) => {
			this.props = Props;
			const prob = eq("function", props.prob) ? props.prob() : (config.probability || 0.5);
			const need = eq("function", props.need) ? props.need() : (config.needs || false);
			const chance = eq("function", props.chance) ? props.chance() : (config.chance || 0.5);
			tq("number", prob);
			tq("boolean", need);
			tq("number", chance);
			//
			const print = chance - Math.random();
			return (need || print > 0) ? Boolean(random(prob)) : null;
		};
	};
	//BUILD
	//function builder
	function MakeFunc (func, schema = {}) {
		//alphabet
		this.props = Props;
		const dec = "0123456789abcdef";
		const n = func.name;
		switch (n) {
			case "String" : func = RandomStringType(dec);
			break;
			case "Number" : func = RandomNumberType();
			break;
			case "Boolean": func = RandomBooleanType();
			break;
		}
		// delete place "type" from schema
		if (schema.type) schema.type = undefined;
		let opts = {};
		for (key in schema) {
			const value = schema[key];
			if (typeof value === "function" && value.name == "__link$") {
				opts[key] = () => {
					const res = value();
					const answ = eq("object", res) ? Finish(res) : res;
					return eq("function", answ) ? answ() : answ;
				}
			}
			else opts[key] = eq("function", value) ? MakeFunc(value) : Finish(Transform(value));
		}
		return (add = {}) => {
			//
			return func({...opts, ...add});
		}
	}
	//
	function TransformArr (schema) {
		//
		let array = [];
		this.props = Props;
		const minSize = config.array_range[0] || 0;
		const maxSize = config.array_range[1] || 10;
		const size = Math.floor(Math.random() * (maxSize - minSize) + minSize);
		for (let i = 0; i < size; ++i)
			array.push(Transform(schema));
		return array;
	}
	//preparing schema to compute
	function Transform (schema) {
		//catch function 
		if (schema && typeof schema.type === "function")
			//function with params
			return (schema.type.name === "__link$")
				? MakeFunc(schema.type) 							// create link object
				: { __value$: MakeFunc(schema.type, Clone(schema)) };	// create type object
		if (typeof schema === "function") 
			//alone function
			return (schema.name === "__link$")
				? MakeFunc(schema) 							// create link object
				: { __value$: MakeFunc(schema) };				// create type object
		//catch primitives 
		if (typeof schema != "object")
			//atom
			return MakeFunc(() => schema);
		//create new object
		let temp = {};
		for (key in schema)
			temp[key] = (Array.isArray(schema[key]))				// check for Array object
				? [ ...TransformArr(schema[key][0]) ] 				// destruct
				: Transform(schema[key]);							// build object by schema
		return temp;
	}
	//activate primal function
	function Build (context) {
		//	
		if (context && typeof context.__value$ === "function") 
			return context;
		//	
		if (typeof context === "function")
			return context();
		// primitives
		if (typeof context != "object" || context === null || context === undefined)
			return context;
		// get object
		Object.keys(context).forEach((k) => {
			context[k] = Build(context[k]);
		})
		return context;
	}
	//clear type constructors
	function Complete (context) {
		//
		if (context && typeof context.__value$ === "function") {
			context.__value$ = context.__value$();
			return context;
		}
		//
		if (typeof context != "object" || context === null || context === undefined)
			return context;
		//
		Object.keys(context).forEach((k) => {
			context[k] = Complete(context[k]);
		})
		return context;
	}
	//to standart pattern
	function Finish (context) {
		//
		if (context && typeof context === "object" && '__value$' in context)
			return context.__value$;
		//
		if (typeof context != "object")
			return context;
		for (k in context) {
			const key = k;
			if (Array.isArray(context[key])) {
				let array = [];
				const size = context[key].length;
				for (let i = 0; i < size; ++i) 
					array.push(Finish(context[key][i]));
				context[key] = array;
			} else {
				context[key] = Finish(context[key]);
			}
		}
		return context;
	}
	//Make and upload
	//maker
	function Make (schema, range) {
		Props = this.props;
		this.schema = schema;
		const minSize = range[0] || (range || 1);
		const maxSize = range[1] || (range || 1);
		const size = Math.floor(Math.random() * (maxSize-minSize) + minSize);
		let sequence = [];
		for (let i = 0; i < size; ++i) {
			//compute context
			Context = Transform(this.schema);
			Schema = this.schema;
			Context = Complete(Build(Context));
			//compute result
			Context = Finish(Context);
			//push to sequence
			sequence.push(Context);
			Context = {};
		}
		return sequence;
	}
};

module.exports = sequenceGenerator;
