import {Image} from 'react-native'
const TabBarIcon = (focused,name)=>{
  let iconImagePath;
  if(name=="Main"){
    iconImagePath = require('../assets/main-menu.png')
  }
  else if(name=="Profile"){
    iconImagePath =require('../assets/user.png')
  }
  return(
    <Image
      style={{
        width:focused ?30:20,
        height:focused ? 30:20
      }}
      source={iconImagePath}
    />
  )
}
export default TabBarIcon