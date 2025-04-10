import React from 'react';
import { Helmet } from 'react-helmet-async';

// Page-specific styles
const styles = `

    @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
        .header-blur-background {
            
            
        }
    }



  .top-bun, 
  .patty, 
  .bottom-bun {
    height: 1px;
  }



  .top-bun, 
  .patty, 
  .bottom-bun {
    height: 1px;
  }




.fe-670ee6057b1b2b006eab6445 {
  --grid-gutter: calc(var(--sqs-mobile-site-gutter, 6vw) - 11.0px);
  --cell-max-width: calc( ( var(--sqs-site-max-width, 1500px) - (11.0px * (8 - 1)) ) / 8 );

  display: grid;
  position: relative;
  grid-area: 1/1/-1/-1;
  grid-template-rows: repeat(8,minmax(24px, auto));
  grid-template-columns:
    minmax(var(--grid-gutter), 1fr)
    repeat(8, minmax(0, var(--cell-max-width)))
    minmax(var(--grid-gutter), 1fr);
  row-gap: 11.0px;
  column-gap: 11.0px;
}

@media (min-width: 768px) {
  .background-width--inset .fe-670ee6057b1b2b006eab6445 {
    --inset-padding: calc(var(--sqs-site-gutter) * 2);
  }

  .fe-670ee6057b1b2b006eab6445 {
    --grid-gutter: calc(var(--sqs-site-gutter, 4vw) - 11.0px);
    --cell-max-width: calc( ( var(--sqs-site-max-width, 1500px) - (11.0px * (24 - 1)) ) / 24 );
    --inset-padding: 0vw;

    --row-height-scaling-factor: 0.0215;
    --container-width: min(var(--sqs-site-max-width, 1500px), calc(100vw - var(--sqs-site-gutter, 4vw) * 2 - var(--inset-padding) ));

    grid-template-rows: repeat(11,minmax(calc(var(--container-width) * var(--row-height-scaling-factor)), auto));
    grid-template-columns:
      minmax(var(--grid-gutter), 1fr)
      repeat(24, minmax(0, var(--cell-max-width)))
      minmax(var(--grid-gutter), 1fr);
  }
}


  .fe-block-yui_3_17_2_1_1728960386549_17190 {
    grid-area: 1/2/3/10;
    z-index: 3;

    @media (max-width: 767px) {
      
        
      
    }
  }

  .fe-block-yui_3_17_2_1_1728960386549_17190 .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-yui_3_17_2_1_1728960386549_17190 .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-yui_3_17_2_1_1728960386549_17190 {
      grid-area: 1/2/4/14;
      z-index: 3;

      
        
      
    }

    .fe-block-yui_3_17_2_1_1728960386549_17190 .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-yui_3_17_2_1_1728960386549_17190 .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

  .fe-block-yui_3_17_2_1_1728960386549_18368 {
    grid-area: 3/2/5/10;
    z-index: 4;

    @media (max-width: 767px) {
      
        
      
    }
  }

  .fe-block-yui_3_17_2_1_1728960386549_18368 .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-yui_3_17_2_1_1728960386549_18368 .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-yui_3_17_2_1_1728960386549_18368 {
      grid-area: 4/2/12/10;
      z-index: 4;

      
        
      
    }

    .fe-block-yui_3_17_2_1_1728960386549_18368 .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-yui_3_17_2_1_1728960386549_18368 .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

  .fe-block-bbbeeb56042494c839a3 {
    grid-area: 5/2/7/10;
    z-index: 4;

    @media (max-width: 767px) {
      
        
      
    }
  }

  .fe-block-bbbeeb56042494c839a3 .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-bbbeeb56042494c839a3 .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-bbbeeb56042494c839a3 {
      grid-area: 1/19/4/26;
      z-index: 4;

      
        
      
    }

    .fe-block-bbbeeb56042494c839a3 .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-bbbeeb56042494c839a3 .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

  .fe-block-3839aa7d77f0817bb72c {
    grid-area: 7/2/9/10;
    z-index: 5;

    @media (max-width: 767px) {
      
        
      
    }
  }

  .fe-block-3839aa7d77f0817bb72c .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-3839aa7d77f0817bb72c .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-3839aa7d77f0817bb72c {
      grid-area: 4/20/12/26;
      z-index: 5;

      
        
      
    }

    .fe-block-3839aa7d77f0817bb72c .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-3839aa7d77f0817bb72c .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }


`;


export default function Home() {
  return (
    <div className="page home-page">
      <Helmet>
        <title>Weekly Lecture — Masjid AS-Salam  -  مسجد السلام</title>
        <style type="text/css">{styles}</style>
      </Helmet>
      <div className="content-wrapper">
        <div dangerouslySetInnerHTML={{ __html: `
    <div id="siteWrapper" className="clearfix site-wrapper">
      
        <div id="floatingCart" className="floating-cart hidden">
          <a href="/preview/22?path=cart%2Findex.html" className="icon icon--stroke icon--fill icon--cart sqs-custom-cart">
            <span className="Cart-inner">
              



  <svg className="icon icon--cart" width="144" height="125" viewBox="0 0 144 125">
<path d="M4.69551 0.000432948C2.10179 0.000432948 0 2.09856 0 4.68769C0 7.27686 2.10183 9.37496 4.69551 9.37496H23.43C31.2022 28.5892 38.8567 47.8378 46.5654 67.089L39.4737 84.129C38.8799 85.5493 39.0464 87.2634 39.905 88.5418C40.7622 89.8216 42.2856 90.6283 43.8271 90.6232H122.088C124.568 90.658 126.85 88.4129 126.85 85.9359C126.85 83.4589 124.569 81.214 122.088 81.2487H50.8702L54.9305 71.5802L130.306 65.5745C132.279 65.4199 134.064 63.8849 134.512 61.9608L143.903 21.337C144.518 18.6009 142.114 15.6147 139.306 15.624H36.0522L30.9654 2.92939C30.2682 1.21146 28.4698 0 26.612 0L4.69551 0.000432948ZM39.8152 24.9999H133.385L126.097 56.5426L54.7339 62.2067L39.8152 24.9999ZM59.4777 93.75C50.8885 93.75 43.8252 100.801 43.8252 109.375C43.8252 117.949 50.8885 125 59.4777 125C68.0669 125 75.1301 117.949 75.1301 109.375C75.1301 100.801 68.0669 93.75 59.4777 93.75ZM106.433 93.75C97.8436 93.75 90.7803 100.801 90.7803 109.375C90.7803 117.949 97.8436 125 106.433 125C115.022 125 122.085 117.949 122.085 109.375C122.085 100.801 115.022 93.75 106.433 93.75ZM59.4777 103.125C62.9906 103.125 65.7378 105.867 65.7378 109.374C65.7378 112.88 62.9905 115.623 59.4777 115.623C55.9647 115.623 53.2175 112.88 53.2175 109.374C53.2175 105.867 55.9649 103.125 59.4777 103.125ZM106.433 103.125C109.946 103.125 112.693 105.867 112.693 109.374C112.693 112.88 109.946 115.623 106.433 115.623C102.92 115.623 100.173 112.88 100.173 109.374C100.173 105.867 102.92 103.125 106.433 103.125Z"></path>
</svg>


              <div className="legacy-cart icon-cart-quantity">
                <span className="sqs-cart-quantity">0</span>
              </div>
            </span>
          </a>
        </div>
      

      












  <header data-test="header" id="header" className="
      
        
          
        
      
      header theme-col--primary
    " data-section-theme="" data-controller="Header" data-current-styles="{
&quot;layout&quot;: &quot;navRight&quot;,
&quot;action&quot;: {
&quot;href&quot;: &quot;/appointments&quot;,
&quot;buttonText&quot;: &quot;Book now&quot;,
&quot;newWindow&quot;: false
},
&quot;showSocial&quot;: false,
&quot;socialOptions&quot;: {
&quot;socialBorderShape&quot;: &quot;none&quot;,
&quot;socialBorderStyle&quot;: &quot;outline&quot;,
&quot;socialBorderThickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 1.0
}
},
&quot;menuOverlayAnimation&quot;: &quot;fade&quot;,
&quot;cartStyle&quot;: &quot;text&quot;,
&quot;cartText&quot;: &quot;Cart&quot;,
&quot;showEmptyCartState&quot;: false,
&quot;cartOptions&quot;: {
&quot;iconType&quot;: &quot;stroke-9&quot;,
&quot;cartBorderShape&quot;: &quot;none&quot;,
&quot;cartBorderStyle&quot;: &quot;outline&quot;,
&quot;cartBorderThickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 1.0
}
},
&quot;showButton&quot;: false,
&quot;showCart&quot;: false,
&quot;showAccountLogin&quot;: false,
&quot;headerStyle&quot;: &quot;dynamic&quot;,
&quot;languagePicker&quot;: {
&quot;enabled&quot;: false,
&quot;iconEnabled&quot;: false,
&quot;iconType&quot;: &quot;globe&quot;,
&quot;flagShape&quot;: &quot;shiny&quot;,
&quot;languageFlags&quot;: [ ]
},
&quot;iconOptions&quot;: {
&quot;desktopDropdownIconOptions&quot;: {
&quot;endcapType&quot;: &quot;square&quot;,
&quot;folderDropdownIcon&quot;: &quot;none&quot;,
&quot;languagePickerIcon&quot;: &quot;openArrowHead&quot;
},
&quot;mobileDropdownIconOptions&quot;: {
&quot;endcapType&quot;: &quot;square&quot;,
&quot;folderDropdownIcon&quot;: &quot;openArrowHead&quot;,
&quot;languagePickerIcon&quot;: &quot;openArrowHead&quot;
}
},
&quot;mobileOptions&quot;: {
&quot;layout&quot;: &quot;logoLeftNavRight&quot;,
&quot;menuIconOptions&quot;: {
&quot;style&quot;: &quot;doubleLineHamburger&quot;,
&quot;thickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 1.0
}
}
},
&quot;solidOptions&quot;: {
&quot;headerOpacity&quot;: {
&quot;unit&quot;: &quot;%&quot;,
&quot;value&quot;: 100.0
},
&quot;blurBackground&quot;: {
&quot;enabled&quot;: false,
&quot;blurRadius&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
}
}
},
&quot;gradientOptions&quot;: {
&quot;gradientType&quot;: &quot;faded&quot;,
&quot;headerOpacity&quot;: {
&quot;unit&quot;: &quot;%&quot;,
&quot;value&quot;: 90.0
},
&quot;blurBackground&quot;: {
&quot;enabled&quot;: false,
&quot;blurRadius&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
}
}
},
&quot;dropShadowOptions&quot;: {
&quot;enabled&quot;: false,
&quot;blur&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
},
&quot;spread&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 0.0
},
&quot;distance&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
}
},
&quot;borderOptions&quot;: {
&quot;enabled&quot;: false,
&quot;position&quot;: &quot;allSides&quot;,
&quot;thickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 4.0
}
},
&quot;showPromotedElement&quot;: false,
&quot;buttonVariant&quot;: &quot;primary&quot;,
&quot;blurBackground&quot;: {
&quot;enabled&quot;: false,
&quot;blurRadius&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
}
},
&quot;headerOpacity&quot;: {
&quot;unit&quot;: &quot;%&quot;,
&quot;value&quot;: 100.0
}
}" data-section-id="header" data-header-style="dynamic" data-language-picker="{
&quot;enabled&quot;: false,
&quot;iconEnabled&quot;: false,
&quot;iconType&quot;: &quot;globe&quot;,
&quot;flagShape&quot;: &quot;shiny&quot;,
&quot;languageFlags&quot;: [ ]
}" data-first-focusable-element="" tabindex="-1" style="
      
      
      
      
      
      
    ">
    <svg style="display:none" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
  <symbol id="circle">
    <path d="M11.5 17C14.5376 17 17 14.5376 17 11.5C17 8.46243 14.5376 6 11.5 6C8.46243 6 6 8.46243 6 11.5C6 14.5376 8.46243 17 11.5 17Z" fill="none"></path>
  </symbol>

  <symbol id="circleFilled">
    <path d="M11.5 17C14.5376 17 17 14.5376 17 11.5C17 8.46243 14.5376 6 11.5 6C8.46243 6 6 8.46243 6 11.5C6 14.5376 8.46243 17 11.5 17Z"></path>
  </symbol>

  <symbol id="dash">
    <path d="M11 11H19H3"></path>
  </symbol>

  <symbol id="squareFilled">
    <rect x="6" y="6" width="11" height="11"></rect>
  </symbol>

  <symbol id="square">
    <rect x="7" y="7" width="9" height="9" fill="none" stroke="inherit"></rect>
  </symbol>
  
  <symbol id="plus">
    <path d="M11 3V11M11 19V11M11 11H19H3" fill="none"></path>
  </symbol>
  
  <symbol id="closedArrow">
    <path d="M11 11V2M11 18.1797L17 11.1477L5 11.1477L11 18.1797Z" fill="none"></path>
  </symbol>
  
  <symbol id="closedArrowFilled">
    <path d="M11 11L11 2" stroke="inherit" fill="none"></path>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.74695 9.38428L19.038 9.38428L10.8925 19.0846L2.74695 9.38428Z" stroke-width="1"></path>
  </symbol>
  
  <symbol id="closedArrowHead" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/symbol">
    <path d="M18 7L11 15L4 7L18 7Z" fill="none" stroke="inherit"></path>
  </symbol>
  
  
  <symbol id="closedArrowHeadFilled" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/symbol">
    <path d="M18.875 6.5L11 15.5L3.125 6.5L18.875 6.5Z"></path>
  </symbol>
  
  <symbol id="openArrow">
    <path d="M11 18.3591L11 3" stroke="inherit" fill="none"></path>
    <path d="M18 11.5L11 18.5L4 11.5" stroke="inherit" fill="none"></path>
  </symbol>
  
  <symbol id="openArrowHead">
    <path d="M18 7L11 14L4 7" fill="none"></path>
  </symbol>

  <symbol id="pinchedArrow">
    <path d="M11 17.3591L11 2" fill="none"></path>
    <path d="M2 11C5.85455 12.2308 8.81818 14.9038 11 18C13.1818 14.8269 16.1455 12.1538 20 11" fill="none"></path>
  </symbol>

  <symbol id="pinchedArrowFilled">
    <path d="M11.05 10.4894C7.04096 8.73759 1.05005 8 1.05005 8C6.20459 11.3191 9.41368 14.1773 11.05 21C12.6864 14.0851 15.8955 11.227 21.05 8C21.05 8 15.0591 8.73759 11.05 10.4894Z" stroke-width="1"></path>
    <path d="M11 16.3591L11 1" fill="none"></path>
  </symbol>

  <symbol id="pinchedArrowHead">
    <path d="M2 7.24091C5.85455 8.40454 8.81818 10.9318 11 13.8591C13.1818 10.8591 16.1455 8.33181 20 7.24091" fill="none"></path>
  </symbol>
  
  <symbol id="pinchedArrowHeadFilled">
    <path d="M11.05 7.1591C7.04096 5.60456 1.05005 4.95001 1.05005 4.95001C6.20459 7.89547 9.41368 10.4318 11.05 16.4864C12.6864 10.35 15.8955 7.81365 21.05 4.95001C21.05 4.95001 15.0591 5.60456 11.05 7.1591Z"></path>
  </symbol>

</svg>
    
<div className="sqs-announcement-bar-dropzone"></div>

    <div className="header-announcement-bar-wrapper">
      
      <a href="#page" className="header-skip-link sqs-button-element--primary">
        Skip to Content
      </a>
      


<style>
    @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
        .header-blur-background {
            
            
        }
    }
</style>
      <div className="header-border" data-header-style="dynamic" data-header-border="false" data-test="header-border" style="




"></div>
      <div className="header-dropshadow" data-header-style="dynamic" data-header-dropshadow="false" data-test="header-dropshadow" style=""></div>
      
      

      <div className="header-inner container--fluid
        
        
        
         header-mobile-layout-logo-left-nav-right
        
        
        
        
        
        
         header-layout-nav-right
        
        
        
        
        
        
        
        
        " data-test="header-inner">
        <!-- Background -->
        <div className="header-background theme-bg--primary"></div>

        <div className="header-display-desktop" data-content-field="site-title">
          

          

          

          

          

          
          
            
            <!-- Social -->
            
          
            
            <!-- Title and nav wrapper -->
            <div className="header-title-nav-wrapper">
              

              

              
                
                <!-- Title -->
                
                  <div className="
                      header-title
                      
                    " data-animation-role="header-element">
                    
                      <div className="header-title-text">
                        <a id="site-title" href="/preview/22?path=index.html" data-animation-role="header-element">Masjid AS-Salam  -  مسجد السلام</a>
                      </div>
                    
                    
                  </div>
                
              
                
                <!-- Nav -->
                <div className="header-nav">
                  <div className="header-nav-wrapper">
                    <nav className="header-nav-list">
                      


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fjummah%2Findex.html" data-animation-role="header-element">
        خطبة الجمعة
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fjummah%2Findex.html" data-animation-role="header-element">
        Jummah
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fabout%2Findex.html" data-animation-role="header-element">
        About
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fabout%2Findex.html" data-animation-role="header-element">
        عن المسجد
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fservices%2Findex.html" data-animation-role="header-element">
        Services
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fservices%2Findex.html" data-animation-role="header-element">
        الخدمات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection header-nav-item--active">
      <a href="/preview/22?path=en%2Fevents%2Findex.html" data-animation-role="header-element" aria-current="page">
        Events
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fevents%2Findex.html" data-animation-role="header-element">
        النشاطات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fresources%2Findex.html" data-animation-role="header-element">
        Resources
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fresources%2Findex.html" data-animation-role="header-element">
        المعلومات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fdonations%2Findex.html" data-animation-role="header-element">
        Donations
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fdonations%2Findex.html" data-animation-role="header-element">
        التبرعات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fcontact%2Findex.html" data-animation-role="header-element">
        Contact
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fcontact%2Findex.html" data-animation-role="header-element">
        اتصل بنا
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fimam-corner%2Findex.html" data-animation-role="header-element">
        Imam's Corner
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fimam-corner%2Findex.html" data-animation-role="header-element">
        ركن الإمام
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--folder">
      <a className="header-nav-folder-title" href="/preview/22?path=language%2Findex.html" tabindex="-1" data-animation-role="header-element">
      <span className="header-nav-folder-title-text">
        Language / اللغة
      </span>
      </a>
      <div className="header-nav-folder-content">
        
          
          
            <div className="header-nav-folder-item header-nav-folder-item--external">
              <a href="/preview/22?path=en%2Fhome%2Findex.html">English</a>
            </div>
          
        
          
          
            <div className="header-nav-folder-item header-nav-folder-item--external">
              <a href="/preview/22?path=ar%2Fhome%2Findex.html">العربية</a>
            </div>
          
        
      </div>
    </div>
  
  



                    </nav>
                  </div>
                </div>
              
              
            </div>
          
            
            <!-- Actions -->
            <div className="header-actions header-actions--right">
              
                
              
              

              

            
            

              
              <div className="showOnMobile">
                
              </div>

              
              <div className="showOnDesktop">
                
              </div>

              
            </div>
          
            


<style>
  .top-bun, 
  .patty, 
  .bottom-bun {
    height: 1px;
  }
</style>

<!-- Burger -->
<div className="header-burger

  menu-overlay-does-not-have-visible-non-navigation-items


  
  no-actions
  
" data-animation-role="header-element">
  <button className="header-burger-btn burger" data-test="header-burger">
    <span hidden="" className="js-header-burger-open-title visually-hidden">Open Menu</span>
    <span hidden="" className="js-header-burger-close-title visually-hidden">Close Menu</span>
    <div className="burger-box">
      <div className="burger-inner header-menu-icon-doubleLineHamburger">
        <div className="top-bun"></div>
        <div className="patty"></div>
        <div className="bottom-bun"></div>
      </div>
    </div>
  </button>
</div>

          
          
          
          
          

        </div>
        <div className="header-display-mobile" data-content-field="site-title">
          
            
            <!-- Social -->
            
          
            
            <!-- Title and nav wrapper -->
            <div className="header-title-nav-wrapper">
              

              

              
                
                <!-- Title -->
                
                  <div className="
                      header-title
                      
                    " data-animation-role="header-element">
                    
                      <div className="header-title-text">
                        <a id="site-title" href="/preview/22?path=index.html" data-animation-role="header-element">Masjid AS-Salam  -  مسجد السلام</a>
                      </div>
                    
                    
                  </div>
                
              
                
                <!-- Nav -->
                <div className="header-nav">
                  <div className="header-nav-wrapper">
                    <nav className="header-nav-list">
                      


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fjummah%2Findex.html" data-animation-role="header-element">
        خطبة الجمعة
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fjummah%2Findex.html" data-animation-role="header-element">
        Jummah
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fabout%2Findex.html" data-animation-role="header-element">
        About
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fabout%2Findex.html" data-animation-role="header-element">
        عن المسجد
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fservices%2Findex.html" data-animation-role="header-element">
        Services
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fservices%2Findex.html" data-animation-role="header-element">
        الخدمات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection header-nav-item--active">
      <a href="/preview/22?path=en%2Fevents%2Findex.html" data-animation-role="header-element" aria-current="page">
        Events
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fevents%2Findex.html" data-animation-role="header-element">
        النشاطات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fresources%2Findex.html" data-animation-role="header-element">
        Resources
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fresources%2Findex.html" data-animation-role="header-element">
        المعلومات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fdonations%2Findex.html" data-animation-role="header-element">
        Donations
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fdonations%2Findex.html" data-animation-role="header-element">
        التبرعات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fcontact%2Findex.html" data-animation-role="header-element">
        Contact
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fcontact%2Findex.html" data-animation-role="header-element">
        اتصل بنا
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=en%2Fimam-corner%2Findex.html" data-animation-role="header-element">
        Imam's Corner
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/22?path=ar%2Fimam-corner%2Findex.html" data-animation-role="header-element">
        ركن الإمام
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--folder">
      <a className="header-nav-folder-title" href="/preview/22?path=language%2Findex.html" tabindex="-1" data-animation-role="header-element">
      <span className="header-nav-folder-title-text">
        Language / اللغة
      </span>
      </a>
      <div className="header-nav-folder-content">
        
          
          
            <div className="header-nav-folder-item header-nav-folder-item--external">
              <a href="/preview/22?path=en%2Fhome%2Findex.html">English</a>
            </div>
          
        
          
          
            <div className="header-nav-folder-item header-nav-folder-item--external">
              <a href="/preview/22?path=ar%2Fhome%2Findex.html">العربية</a>
            </div>
          
        
      </div>
    </div>
  
  



                    </nav>
                  </div>
                </div>
              
              
            </div>
          
            
            <!-- Actions -->
            <div className="header-actions header-actions--right">
              
                
              
              

              

            
            

              
              <div className="showOnMobile">
                
              </div>

              
              <div className="showOnDesktop">
                
              </div>

              
            </div>
          
            


<style>
  .top-bun, 
  .patty, 
  .bottom-bun {
    height: 1px;
  }
</style>

<!-- Burger -->
<div className="header-burger

  menu-overlay-does-not-have-visible-non-navigation-items


  
  no-actions
  
" data-animation-role="header-element">
  <button className="header-burger-btn burger" data-test="header-burger">
    <span hidden="" className="js-header-burger-open-title visually-hidden">Open Menu</span>
    <span hidden="" className="js-header-burger-close-title visually-hidden">Close Menu</span>
    <div className="burger-box">
      <div className="burger-inner header-menu-icon-doubleLineHamburger">
        <div className="top-bun"></div>
        <div className="patty"></div>
        <div className="bottom-bun"></div>
      </div>
    </div>
  </button>
</div>

          
          
          
          
          
        </div>
      </div>
    </div>
    <!-- (Mobile) Menu Navigation -->
    <div className="header-menu header-menu--folder-list
      
      
      
      
      
      " data-section-theme="" data-current-styles="{
&quot;layout&quot;: &quot;navRight&quot;,
&quot;action&quot;: {
&quot;href&quot;: &quot;/appointments&quot;,
&quot;buttonText&quot;: &quot;Book now&quot;,
&quot;newWindow&quot;: false
},
&quot;showSocial&quot;: false,
&quot;socialOptions&quot;: {
&quot;socialBorderShape&quot;: &quot;none&quot;,
&quot;socialBorderStyle&quot;: &quot;outline&quot;,
&quot;socialBorderThickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 1.0
}
},
&quot;menuOverlayAnimation&quot;: &quot;fade&quot;,
&quot;cartStyle&quot;: &quot;text&quot;,
&quot;cartText&quot;: &quot;Cart&quot;,
&quot;showEmptyCartState&quot;: false,
&quot;cartOptions&quot;: {
&quot;iconType&quot;: &quot;stroke-9&quot;,
&quot;cartBorderShape&quot;: &quot;none&quot;,
&quot;cartBorderStyle&quot;: &quot;outline&quot;,
&quot;cartBorderThickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 1.0
}
},
&quot;showButton&quot;: false,
&quot;showCart&quot;: false,
&quot;showAccountLogin&quot;: false,
&quot;headerStyle&quot;: &quot;dynamic&quot;,
&quot;languagePicker&quot;: {
&quot;enabled&quot;: false,
&quot;iconEnabled&quot;: false,
&quot;iconType&quot;: &quot;globe&quot;,
&quot;flagShape&quot;: &quot;shiny&quot;,
&quot;languageFlags&quot;: [ ]
},
&quot;iconOptions&quot;: {
&quot;desktopDropdownIconOptions&quot;: {
&quot;endcapType&quot;: &quot;square&quot;,
&quot;folderDropdownIcon&quot;: &quot;none&quot;,
&quot;languagePickerIcon&quot;: &quot;openArrowHead&quot;
},
&quot;mobileDropdownIconOptions&quot;: {
&quot;endcapType&quot;: &quot;square&quot;,
&quot;folderDropdownIcon&quot;: &quot;openArrowHead&quot;,
&quot;languagePickerIcon&quot;: &quot;openArrowHead&quot;
}
},
&quot;mobileOptions&quot;: {
&quot;layout&quot;: &quot;logoLeftNavRight&quot;,
&quot;menuIconOptions&quot;: {
&quot;style&quot;: &quot;doubleLineHamburger&quot;,
&quot;thickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 1.0
}
}
},
&quot;solidOptions&quot;: {
&quot;headerOpacity&quot;: {
&quot;unit&quot;: &quot;%&quot;,
&quot;value&quot;: 100.0
},
&quot;blurBackground&quot;: {
&quot;enabled&quot;: false,
&quot;blurRadius&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
}
}
},
&quot;gradientOptions&quot;: {
&quot;gradientType&quot;: &quot;faded&quot;,
&quot;headerOpacity&quot;: {
&quot;unit&quot;: &quot;%&quot;,
&quot;value&quot;: 90.0
},
&quot;blurBackground&quot;: {
&quot;enabled&quot;: false,
&quot;blurRadius&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
}
}
},
&quot;dropShadowOptions&quot;: {
&quot;enabled&quot;: false,
&quot;blur&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
},
&quot;spread&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 0.0
},
&quot;distance&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
}
},
&quot;borderOptions&quot;: {
&quot;enabled&quot;: false,
&quot;position&quot;: &quot;allSides&quot;,
&quot;thickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 4.0
}
},
&quot;showPromotedElement&quot;: false,
&quot;buttonVariant&quot;: &quot;primary&quot;,
&quot;blurBackground&quot;: {
&quot;enabled&quot;: false,
&quot;blurRadius&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 12.0
}
},
&quot;headerOpacity&quot;: {
&quot;unit&quot;: &quot;%&quot;,
&quot;value&quot;: 100.0
}
}" data-section-id="overlay-nav" data-show-account-login="false" data-test="header-menu">
      <div className="header-menu-bg theme-bg--primary"></div>
      <div className="header-menu-nav">
        <nav className="header-menu-nav-list">
          <div data-folder="root" className="header-menu-nav-folder">
            <div className="header-menu-nav-folder-content">
              <!-- Menu Navigation -->
<div className="header-menu-nav-wrapper">
  
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=ar%2Fjummah%2Findex.html">
                <div className="header-menu-nav-item-content">
                  خطبة الجمعة
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=en%2Fjummah%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Jummah
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=en%2Fabout%2Findex.html">
                <div className="header-menu-nav-item-content">
                  About
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=ar%2Fabout%2Findex.html">
                <div className="header-menu-nav-item-content">
                  عن المسجد
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=en%2Fservices%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Services
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=ar%2Fservices%2Findex.html">
                <div className="header-menu-nav-item-content">
                  الخدمات
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection header-menu-nav-item--active">
              <a href="/preview/22?path=en%2Fevents%2Findex.html" aria-current="page">
                <div className="header-menu-nav-item-content">
                  Events
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=ar%2Fevents%2Findex.html">
                <div className="header-menu-nav-item-content">
                  النشاطات
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=en%2Fresources%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Resources
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=ar%2Fresources%2Findex.html">
                <div className="header-menu-nav-item-content">
                  المعلومات
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=en%2Fdonations%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Donations
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=ar%2Fdonations%2Findex.html">
                <div className="header-menu-nav-item-content">
                  التبرعات
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=en%2Fcontact%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Contact
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=ar%2Fcontact%2Findex.html">
                <div className="header-menu-nav-item-content">
                  اتصل بنا
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=en%2Fimam-corner%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Imam's Corner
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/22?path=ar%2Fimam-corner%2Findex.html">
                <div className="header-menu-nav-item-content">
                  ركن الإمام
                </div>
              </a>
            </div>
          
        
      
    
      
        
          <div className="container header-menu-nav-item">
            <a data-folder-id="/language" href="/preview/22?path=language%2Findex.html">
              <div className="header-menu-nav-item-content header-menu-nav-item-content-folder">
                <span className="visually-hidden">Folder:</span>
                <span className="header-nav-folder-title-text">Language / اللغة</span>
              </div>
            </a>
          </div>
          <div data-folder="/language" className="header-menu-nav-folder">
            <div className="header-menu-nav-folder-content">
              <div className="header-menu-controls container header-menu-nav-item">
                <a className="header-menu-controls-control header-menu-controls-control--active" data-action="back" href="/preview/22?path=index.html">
                  <span>Back</span>
                </a>
              </div>
              
                
                
                  <div className="container header-menu-nav-item header-menu-nav-item--external">
                    <a href="/preview/22?path=en%2Fhome%2Findex.html">English</a>
                  </div>
                
              
                
                
                  <div className="container header-menu-nav-item header-menu-nav-item--external">
                    <a href="/preview/22?path=ar%2Fhome%2Findex.html">العربية</a>
                  </div>
                
              
            </div>
          </div>
        
      
    
  
</div>

              
                
              
            </div>
            
            
            
          </div>
        </nav>
      </div>
    </div>
  </header>




      <main id="page" className="container" role="main">
        
          
<article className="sections" id="sections" data-page-sections="670e668ad42c6b61fc49153c">
  
  
    
    


  
  


<section data-test="page-section" data-section-theme="" className="page-section 
    
      content-collection
      full-bleed-section
      collection-type-events-stacked
    
    background-width--full-bleed
    
      section-height--medium
    
    
      content-width--wide
    
    horizontal-alignment--center
    vertical-alignment--middle
    
      
    
    
    " data-section-id="670e668ad42c6b61fc491540" data-controller="SectionWrapperController" data-current-styles="{
&quot;imageOverlayOpacity&quot;: 0.15,
&quot;backgroundWidth&quot;: &quot;background-width--full-bleed&quot;,
&quot;sectionHeight&quot;: &quot;section-height--medium&quot;,
&quot;customSectionHeight&quot;: 10,
&quot;horizontalAlignment&quot;: &quot;horizontal-alignment--center&quot;,
&quot;verticalAlignment&quot;: &quot;vertical-alignment--middle&quot;,
&quot;contentWidth&quot;: &quot;content-width--wide&quot;,
&quot;customContentWidth&quot;: 50,
&quot;backgroundColor&quot;: &quot;&quot;,
&quot;sectionTheme&quot;: &quot;&quot;,
&quot;sectionAnimation&quot;: &quot;none&quot;,
&quot;backgroundMode&quot;: &quot;image&quot;
}" data-current-context="{
&quot;video&quot;: {
&quot;playbackSpeed&quot;: 0.5,
&quot;filter&quot;: 1,
&quot;filterStrength&quot;: 0,
&quot;zoom&quot;: 0,
&quot;videoSourceProvider&quot;: &quot;none&quot;
},
&quot;backgroundImageId&quot;: null,
&quot;backgroundMediaEffect&quot;: null,
&quot;divider&quot;: null,
&quot;typeName&quot;: &quot;events-stacked&quot;
}" data-animation="none">
  <div className="section-border">
    <div className="section-background">
    
      
    
    </div>
  </div>
  <div className="content-wrapper" style="
      
      
    ">
    <div className="content">
      
      
      
      
      
      
      
      
      <div className="events-item-wrapper events-stacked-item-wrapper" data-content-field="main-content" data-item-id="">
  <div className="sqs-events-collection-item events events-item">

  <a href="/preview/22?path=en%2Fevents%2Findex.html" className="eventitem-backlink">Back to All Events</a>

  
  <article className="eventitem " id="article-670e668ad42c6b61fc491530" data-item-id="670e668ad42c6b61fc491530">

    <div className="eventitem-column-meta">

      <h1 className="eventitem-title" data-content-field="title">Weekly Lecture</h1>

      <ul className="eventitem-meta event-meta event-meta-date-time-container" data-content-field="event-date-time-range">

        

        <li className="eventitem-meta-item eventitem-meta-date event-meta-item">
          <time className="event-date" datetime="2025-01-04">Saturday, January 4, 2025</time>
        </li>

        <li className="eventitem-meta-item eventitem-meta-time event-meta-item">
          <span className="event-time-localized">
            <time className="event-time-localized-start" datetime="2025-01-04">7:30 PM</time>
            <span className="event-datetime-divider"></span>
            <time className="event-time-localized-end" datetime="2025-01-04">8:30 PM</time>
          </span>
        </li>

        

      </ul>

      
        
        <ul className="eventitem-meta event-meta event-meta-address-container" data-content-field="location">
          <li className="eventitem-meta-item eventitem-meta-address">
          <span className="eventitem-meta-address-line eventitem-meta-address-line--title">Masjid As-Salam</span>
          <span className="eventitem-meta-address-line">2824 John F. Kennedy Boulevard</span>
          <span className="eventitem-meta-address-line">Jersey City, NJ, 07306</span>
          <span className="eventitem-meta-address-line">United States</span>
          <a href="http://maps.google.com?q=2824 John F. Kennedy Boulevard Jersey City, NJ, 07306 United States" className="eventitem-meta-address-maplink" target="_blank">(map)</a>
          </li>
        </ul>
        
      

      <ul className="eventitem-meta event-meta event-meta-addtocalendar-container">
        <li className="eventitem-meta-item eventitem-meta-export event-meta-item">
          <a href="http://www.google.com/calendar/event?action=TEMPLATE&amp;text=Weekly%20Lecture&amp;dates=20250105T003000Z/20250105T013000Z&amp;location=2824%20John%20F.%20Kennedy%20Boulevard%2C%20Jersey%20City%2C%20NJ%2C%2007306%2C%20United%20States" className="eventitem-meta-export-google">Google Calendar</a>
          <span className="eventitem-meta-export-divider"></span>
          <a href="/preview/22?path=en%2Fevents%2Fevent-one-tsts3%2Findex.html" className="eventitem-meta-export-ical">ICS</a>
        </li>
      </ul>

      
      

    </div>

    <div className="eventitem-column-content">

      <div className="sqs-layout sqs-grid-12 columns-12" data-layout-label="Post Body" data-type="item" id="item-670e668ad42c6b61fc491530"><div className="row sqs-row"><div className="col sqs-col-12 span-12"><div className="sqs-block html-block sqs-block-html" data-block-type="2" data-border-radii="{&quot;topLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;topRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0}}" id="block-68b9a85a7e814b157bf9"><div className="sqs-block-content">

<div className="sqs-html-content">
  <p className="" style="white-space:pre-wrap;">Join Shikh Abdul Kareem and the guest in our Weekly lecture every Saturday between Maghrib and Isha’ in Summer and  after Isha’ in Winter.</p>
</div>




















  
  



</div></div></div></div></div>

      
      <div className="eventitem-content-footer">

        

        
      </div>
      

    </div>

    <div className="clear"></div>

  </article>

  

  <div className="clear"></div>

</div>

</div>
    </div>
  
  </div>
  
</section>

  
</article>


          

          
            
              <section id="itemPagination" className="item-pagination item-pagination--prev-next" data-collection-type="events-stacked">
  
  
  
  
</section>

            
          
        
      </main>
      
        <footer className="sections" id="footer-sections" data-footer-sections="">
  
  
  
  
  
  
    
    


  
  


<section data-test="page-section" data-section-theme="" className="page-section 
    
      full-bleed-section
      layout-engine-section
    
    background-width--full-bleed
    
      section-height--small
    
    
      content-width--wide
    
    horizontal-alignment--center
    vertical-alignment--top
    
      
    
    
    " data-section-id="670ee605fe7c597f9f761551" data-controller="SectionWrapperController" data-current-styles="{
&quot;imageOverlayOpacity&quot;: 0.15,
&quot;backgroundWidth&quot;: &quot;background-width--full-bleed&quot;,
&quot;sectionHeight&quot;: &quot;section-height--small&quot;,
&quot;customSectionHeight&quot;: 1,
&quot;horizontalAlignment&quot;: &quot;horizontal-alignment--center&quot;,
&quot;verticalAlignment&quot;: &quot;vertical-alignment--top&quot;,
&quot;contentWidth&quot;: &quot;content-width--wide&quot;,
&quot;customContentWidth&quot;: 50,
&quot;backgroundColor&quot;: &quot;&quot;,
&quot;sectionTheme&quot;: &quot;&quot;,
&quot;sectionAnimation&quot;: &quot;none&quot;,
&quot;backgroundMode&quot;: &quot;image&quot;
}" data-current-context="{
&quot;video&quot;: {
&quot;playbackSpeed&quot;: 0.5,
&quot;filter&quot;: 1,
&quot;filterStrength&quot;: 0,
&quot;zoom&quot;: 0,
&quot;videoSourceProvider&quot;: &quot;none&quot;
},
&quot;backgroundImageId&quot;: null,
&quot;backgroundMediaEffect&quot;: {
&quot;type&quot;: &quot;none&quot;
},
&quot;divider&quot;: {
&quot;enabled&quot;: false
},
&quot;typeName&quot;: &quot;events-stacked&quot;
}" data-animation="none" data-fluid-engine-section="">
  <div className="section-border">
    <div className="section-background">
    
      
    
    </div>
  </div>
  <div className="content-wrapper" style="
      
        
      
    ">
    <div className="content">
      
      
      
      
      
      
      
      
      <div data-fluid-engine="true"><style>

.fe-670ee6057b1b2b006eab6445 {
  --grid-gutter: calc(var(--sqs-mobile-site-gutter, 6vw) - 11.0px);
  --cell-max-width: calc( ( var(--sqs-site-max-width, 1500px) - (11.0px * (8 - 1)) ) / 8 );

  display: grid;
  position: relative;
  grid-area: 1/1/-1/-1;
  grid-template-rows: repeat(8,minmax(24px, auto));
  grid-template-columns:
    minmax(var(--grid-gutter), 1fr)
    repeat(8, minmax(0, var(--cell-max-width)))
    minmax(var(--grid-gutter), 1fr);
  row-gap: 11.0px;
  column-gap: 11.0px;
}

@media (min-width: 768px) {
  .background-width--inset .fe-670ee6057b1b2b006eab6445 {
    --inset-padding: calc(var(--sqs-site-gutter) * 2);
  }

  .fe-670ee6057b1b2b006eab6445 {
    --grid-gutter: calc(var(--sqs-site-gutter, 4vw) - 11.0px);
    --cell-max-width: calc( ( var(--sqs-site-max-width, 1500px) - (11.0px * (24 - 1)) ) / 24 );
    --inset-padding: 0vw;

    --row-height-scaling-factor: 0.0215;
    --container-width: min(var(--sqs-site-max-width, 1500px), calc(100vw - var(--sqs-site-gutter, 4vw) * 2 - var(--inset-padding) ));

    grid-template-rows: repeat(11,minmax(calc(var(--container-width) * var(--row-height-scaling-factor)), auto));
    grid-template-columns:
      minmax(var(--grid-gutter), 1fr)
      repeat(24, minmax(0, var(--cell-max-width)))
      minmax(var(--grid-gutter), 1fr);
  }
}


  .fe-block-yui_3_17_2_1_1728960386549_17190 {
    grid-area: 1/2/3/10;
    z-index: 3;

    @media (max-width: 767px) {
      
        
      
    }
  }

  .fe-block-yui_3_17_2_1_1728960386549_17190 .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-yui_3_17_2_1_1728960386549_17190 .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-yui_3_17_2_1_1728960386549_17190 {
      grid-area: 1/2/4/14;
      z-index: 3;

      
        
      
    }

    .fe-block-yui_3_17_2_1_1728960386549_17190 .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-yui_3_17_2_1_1728960386549_17190 .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

  .fe-block-yui_3_17_2_1_1728960386549_18368 {
    grid-area: 3/2/5/10;
    z-index: 4;

    @media (max-width: 767px) {
      
        
      
    }
  }

  .fe-block-yui_3_17_2_1_1728960386549_18368 .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-yui_3_17_2_1_1728960386549_18368 .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-yui_3_17_2_1_1728960386549_18368 {
      grid-area: 4/2/12/10;
      z-index: 4;

      
        
      
    }

    .fe-block-yui_3_17_2_1_1728960386549_18368 .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-yui_3_17_2_1_1728960386549_18368 .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

  .fe-block-bbbeeb56042494c839a3 {
    grid-area: 5/2/7/10;
    z-index: 4;

    @media (max-width: 767px) {
      
        
      
    }
  }

  .fe-block-bbbeeb56042494c839a3 .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-bbbeeb56042494c839a3 .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-bbbeeb56042494c839a3 {
      grid-area: 1/19/4/26;
      z-index: 4;

      
        
      
    }

    .fe-block-bbbeeb56042494c839a3 .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-bbbeeb56042494c839a3 .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

  .fe-block-3839aa7d77f0817bb72c {
    grid-area: 7/2/9/10;
    z-index: 5;

    @media (max-width: 767px) {
      
        
      
    }
  }

  .fe-block-3839aa7d77f0817bb72c .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-3839aa7d77f0817bb72c .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-3839aa7d77f0817bb72c {
      grid-area: 4/20/12/26;
      z-index: 5;

      
        
      
    }

    .fe-block-3839aa7d77f0817bb72c .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-3839aa7d77f0817bb72c .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

</style><div className="fluid-engine fe-670ee6057b1b2b006eab6445"><div className="fe-block fe-block-yui_3_17_2_1_1728960386549_17190"><div className="sqs-block html-block sqs-block-html" data-blend-mode="NORMAL" data-block-type="2" data-border-radii="{&quot;topLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;topRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0}}" id="block-yui_3_17_2_1_1728960386549_17190"><div className="sqs-block-content">

<div className="sqs-html-content">
  <h2 style="white-space:pre-wrap;">Masjid AS-Salam</h2>
</div>




















  
  



</div></div></div><div className="fe-block fe-block-yui_3_17_2_1_1728960386549_18368"><div className="sqs-block html-block sqs-block-html" data-blend-mode="NORMAL" data-block-type="2" data-border-radii="{&quot;topLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;topRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0}}" id="block-yui_3_17_2_1_1728960386549_18368"><div className="sqs-block-content">

<div className="sqs-html-content">
  <h4 style="white-space:pre-wrap;"><strong>Hours of operations</strong></h4><p className="" style="white-space:pre-wrap;">Opens daily to the public:&nbsp;</p><ul data-rte-list="default"><li><p className="" style="white-space:pre-wrap;">Opens 30 minutes before dawn (Fajr) .</p></li><li><p className="" style="white-space:pre-wrap;">Closes 1 hour after Fajr.</p></li><li><p className="" style="white-space:pre-wrap;">Opens 30 minutes before Thuhr (noon).</p></li><li><p className="" style="white-space:pre-wrap;">Closes 20 minutes after Isha'a (supper).</p></li><li><p className="" style="white-space:pre-wrap;">Opens 1 hour before Jumaa (Friday).</p></li></ul>
</div>




















  
  



</div></div></div><div className="fe-block fe-block-bbbeeb56042494c839a3"><div className="sqs-block html-block sqs-block-html" data-blend-mode="NORMAL" data-block-type="2" data-border-radii="{&quot;topLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;topRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0}}" id="block-bbbeeb56042494c839a3"><div className="sqs-block-content">

<div className="sqs-html-content">
  <h1 style="text-align:right;white-space:pre-wrap;">مسجد السّلام</h1>
</div>




















  
  



</div></div></div><div className="fe-block fe-block-3839aa7d77f0817bb72c"><div className="sqs-block html-block sqs-block-html" data-blend-mode="NORMAL" data-block-type="2" data-border-radii="{&quot;topLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;topRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0}}" id="block-3839aa7d77f0817bb72c"><div className="sqs-block-content">

<div className="sqs-html-content">
  <h3 style="text-align:right;white-space:pre-wrap;"><strong>ساعات العمل</strong></h3><p style="text-align:right;white-space:pre-wrap;" className="">يفتح أبوابه للجمهور يوميًا:ـ</p><p style="text-align:right;white-space:pre-wrap;" className="">ـ يفتح قبل الفجر بـ 30 دقيقة</p><p style="text-align:right;white-space:pre-wrap;" className="">ـ يغلق بعد الفجر بساعة</p><p style="text-align:right;white-space:pre-wrap;" className="">ـ يفتح قبل الظهر بـ 30 دقيقة</p><p style="text-align:right;white-space:pre-wrap;" className="">ـ يغلق بعد العشاء بـ 20 دقيقة</p><p style="text-align:right;white-space:pre-wrap;" className="">ـ يفتح قبل الجمعة بساعة</p>
</div>




















  
  



</div></div></div></div></div>
    </div>
  
  </div>
  
</section>

  
</footer>

      
    </div>

    <script defer="true" src="/api/assets/22/assets/static/vta/5c5a519771c10ba3470d8101/scripts/site-bundle.eb4526b19b26a261df1b48c8d6036e5e.js" type="text/javascript"></script>
    <script src="/api/assets/22/assets/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script>
  $(function() { 
  /* SETUP MULTI-LANGUAGE */
  var defaultLanguage = 'en';
  var lang = location.pathname.split("/")[1];
  var defaultClass = 'lang-'+defaultLanguage+'';
  var itemParent = "nav [class*='collection'],nav [class*='folder'],nav [class*='index'],nav [class*='group']";
  if (lang == "" || lang.length > 2 ){
    var lang = defaultLanguage;
  }

  /* ADD LANGUAGE CLASSES */
  $('a[href="/"]').addClass('lang-'+defaultLanguage+'').parents(itemParent).addClass('lang-'+defaultLanguage+'');
  $('nav a:link:not([href^="http://"]):not([href^="https://"])').each(function () {
    var langType = $(this).attr('href').split("/")[1];
    var multiLanguageClass = 'multilanguage lang-' + langType + '';
    if (undefined !== langType && langType.length <= 2) 
      $(this).addClass(multiLanguageClass).parents(itemParent).addClass(multiLanguageClass);
  });
  $('nav button').each(function () {
    var langTypeFolder = $(this).attr('data-controller-folder-toggle').split("/")[0];
    var multiLanguageClass = 'multilanguage lang-' + langTypeFolder + '';
    if (undefined !== langTypeFolder && langTypeFolder.length <= 2) 
      $(this).addClass(multiLanguageClass);
  });

  /* HOMEPAGE-LOGO LINKS TO PROPER LANGUAGE HOMEPAGE */
  if (lang == "ar") {
    $('a[href="/"]').attr("href", "/ar/home/");
  }

  /* ADD EXCLUSION NAV ITEMS */
  $('.header-nav-folder-item div').addClass('exclude');
  $('.header-nav-folder-item--external').addClass('exclude');
  $('.header-menu-nav-item--external').addClass('exclude');
  $('.header-menu-nav-item--external div').addClass('exclude');
  $('.header-menu-nav-item--external a').addClass('exclude');
  $('.header-nav-folder-item--external a').addClass('exclude');
   
  $('.exclude-me,.exclude-me a').addClass('exclude');
  $('.sqs-svg-icon--list a,.SocialLinks-link,.header-menu-controls-control').addClass('exclude');

  /* REMOVE OTHER LANGUAGES AND KEEP EXCLUDED ITEMS */
  $('.multilanguage:not(".lang-'+lang+',.exclude")').remove();
});
</script><svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="display:none" data-usage="social-icons-svg"><symbol id="facebook-unauth-icon" viewBox="0 0 64 64"><path d="M34.1,47V33.3h4.6l0.7-5.3h-5.3v-3.4c0-1.5,0.4-2.6,2.6-2.6l2.8,0v-4.8c-0.5-0.1-2.2-0.2-4.1-0.2 c-4.1,0-6.9,2.5-6.9,7V28H24v5.3h4.6V47H34.1z"></path></symbol><symbol id="facebook-unauth-mask" viewBox="0 0 64 64"><path d="M0,0v64h64V0H0z M39.6,22l-2.8,0c-2.2,0-2.6,1.1-2.6,2.6V28h5.3l-0.7,5.3h-4.6V47h-5.5V33.3H24V28h4.6V24 c0-4.6,2.8-7,6.9-7c2,0,3.6,0.1,4.1,0.2V22z"></path></symbol></svg>

  

` }} />
      </div>
    </div>
  );
}
