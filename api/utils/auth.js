export default function *authenticate(next){
  try {

    yield next;

  } catch (e) {

    if (e.status == 401 ) {
			this.status = 401;
			this.body = 'I am sorry you left your invitation at home!' ;
    }else { throw err; }


  }

}
