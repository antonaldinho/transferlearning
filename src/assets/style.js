/*
    Credits: Colorlib
    Link: https://colorlib.com/wp/template/login-form-v4/
*/
import './fonts.css';

const limiter = {
    width: '100%',
    margin: '0 auto'
};

const container = {
    width: '100%',
    minHeight: '100vh',
    display: '-webkit-box',
    display: '-webkit-flex',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
};

const wrapper = {
    width: '500px',
    background: '#fff',
    borderRadius: '10px',
    overflow: 'hidden'
};

const title = {
    display: 'block',
    fontFamily: 'Poppins',
    fontSize: '39px',
    fontWeight:'700',
    color: '#333333',
    lineHeight: '1.2',
    textAlign: 'center',
}

const buttonWrapper = {
    display: '-webkit-box',
    display: '-webkit-flex',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
}

const button100 = {
    fontFamily: 'Poppins',
    fontSize: '16px',
    backgroundColor: '#bd59d4',
    lineHeight: '1.2',
    textTransform: 'uppercase',
    display: '-webkit-box',
    display: '-webkit-flex',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 20px',
    width: '100%',
    height: '50px',
    color: 'white',
    borderColor: 'transparent'
}

const button100Wrapper = {
    width: '50%',
    display: 'block',
    position: 'relative',
    zIndex: '1',
    borderRadius: '25px',
    overflow: 'hidden',
    margin: '0 auto',
    boxShadow: '0 10px 30px 0px rgba(189, 89, 212, 0.5)',
    marginTop: '6%',
    marginBottom: '50px'
}

export { limiter, container, wrapper, title, buttonWrapper, button100, button100Wrapper };
