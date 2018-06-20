# waitting-execut

### Install


	npm install waitting-execut
	

### Simple timeout handling:

	let timer = new WaittingExecut({
		waitTime: 1000,
		callBack: () => console.log(1)
	})
	
#### you can trigger by yoourself:
	
	timer.execut();
	
#### also you can cencel it:
	
	timer.abort();
	
#### or reset:

	timer.reset();
	
#### if you want to change another timer and cancel your last timer:

	timer.refresh({
		waitTime: 1000,
		callBack: () => console.log(2)
	});