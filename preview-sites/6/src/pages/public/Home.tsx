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




.fe-670c97bb8fd4ee41efba3982 {
  --grid-gutter: calc(var(--sqs-mobile-site-gutter, 6vw) - 11.0px);
  --cell-max-width: calc( ( var(--sqs-site-max-width, 1500px) - (11.0px * (8 - 1)) ) / 8 );

  display: grid;
  position: relative;
  grid-area: 1/1/-1/-1;
  grid-template-rows: repeat(22,minmax(24px, auto));
  grid-template-columns:
    minmax(var(--grid-gutter), 1fr)
    repeat(8, minmax(0, var(--cell-max-width)))
    minmax(var(--grid-gutter), 1fr);
  row-gap: 11.0px;
  column-gap: 11.0px;
}

@media (min-width: 768px) {
  .background-width--inset .fe-670c97bb8fd4ee41efba3982 {
    --inset-padding: calc(var(--sqs-site-gutter) * 2);
  }

  .fe-670c97bb8fd4ee41efba3982 {
    --grid-gutter: calc(var(--sqs-site-gutter, 4vw) - 11.0px);
    --cell-max-width: calc( ( var(--sqs-site-max-width, 1500px) - (11.0px * (24 - 1)) ) / 24 );
    --inset-padding: 0vw;

    --row-height-scaling-factor: 0.0215;
    --container-width: min(var(--sqs-site-max-width, 1500px), calc(100vw - var(--sqs-site-gutter, 4vw) * 2 - var(--inset-padding) ));

    grid-template-rows: repeat(20,minmax(calc(var(--container-width) * var(--row-height-scaling-factor)), auto));
    grid-template-columns:
      minmax(var(--grid-gutter), 1fr)
      repeat(24, minmax(0, var(--cell-max-width)))
      minmax(var(--grid-gutter), 1fr);
  }
}


  .fe-block-fd20786419a2eec3f55e {
    grid-area: 1/2/12/10;
    z-index: 0;

    @media (max-width: 767px) {
      
    }
  }

  .fe-block-fd20786419a2eec3f55e .sqs-block {
    justify-content: center;
  }

  .fe-block-fd20786419a2eec3f55e .sqs-block-alignment-wrapper {
    align-items: center;
  }

  @media (min-width: 768px) {
    .fe-block-fd20786419a2eec3f55e {
      grid-area: 1/15/21/26;
      z-index: 0;

      
    }

    .fe-block-fd20786419a2eec3f55e .sqs-block {
      justify-content: center;
    }

    .fe-block-fd20786419a2eec3f55e .sqs-block-alignment-wrapper {
      align-items: center;
    }
  }

  .fe-block-6217f46352bc8fd65b55 {
    grid-area: 12/2/14/10;
    z-index: 1;

    @media (max-width: 767px) {
      
    }
  }

  .fe-block-6217f46352bc8fd65b55 .sqs-block {
    justify-content: center;
  }

  .fe-block-6217f46352bc8fd65b55 .sqs-block-alignment-wrapper {
    align-items: center;
  }

  @media (min-width: 768px) {
    .fe-block-6217f46352bc8fd65b55 {
      grid-area: 4/4/6/15;
      z-index: 1;

      
    }

    .fe-block-6217f46352bc8fd65b55 .sqs-block {
      justify-content: center;
    }

    .fe-block-6217f46352bc8fd65b55 .sqs-block-alignment-wrapper {
      align-items: center;
    }
  }

  .fe-block-45556c2a5d4a2fc2132a {
    grid-area: 14/2/21/9;
    z-index: 2;

    @media (max-width: 767px) {
      
    }
  }

  .fe-block-45556c2a5d4a2fc2132a .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-45556c2a5d4a2fc2132a .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-45556c2a5d4a2fc2132a {
      grid-area: 6/4/17/14;
      z-index: 2;

      
    }

    .fe-block-45556c2a5d4a2fc2132a .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-45556c2a5d4a2fc2132a .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

  .fe-block-8e87f5bf2a8812f4407c {
    grid-area: 21/2/23/6;
    z-index: 3;

    @media (max-width: 767px) {
      
    }
  }

  .fe-block-8e87f5bf2a8812f4407c .sqs-block {
    justify-content: center;
  }

  .fe-block-8e87f5bf2a8812f4407c .sqs-block-alignment-wrapper {
    align-items: center;
  }

  @media (min-width: 768px) {
    .fe-block-8e87f5bf2a8812f4407c {
      grid-area: 17/7/19/11;
      z-index: 3;

      
    }

    .fe-block-8e87f5bf2a8812f4407c .sqs-block {
      justify-content: center;
    }

    .fe-block-8e87f5bf2a8812f4407c .sqs-block-alignment-wrapper {
      align-items: center;
    }
  }




      .sqs-block-image .sqs-block-content {
        height: 100%;
        width: 100%;
      }

      
        .fe-block-fd20786419a2eec3f55e .fluidImageOverlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          mix-blend-mode: normal;
          
            
            
          
          
            opacity: 0;
          
        }
      
    


    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] {
      padding-bottom: var(--divider-height);
      z-index: var(--z-index);
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] .background-pause-button {
      bottom: calc(14px + var(--divider-height));
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] .section-divider-svg-clip {
      display: block;
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"].background-width--inset:not(.content-collection):not(.gallery-section):not(.user-items-list-section) {
      padding-bottom: calc(var(--sqs-site-gutter) + var(--divider-height));
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"].background-width--inset:not(.content-collection):not(.gallery-section):not(.user-items-list-section) .section-background {
      bottom: calc(var(--sqs-site-gutter) + var(--divider-height));
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] .section-divider-block {
      height: var(--divider-height);
    }
  


    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] {
      padding-bottom: 2vw;
    }
    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"].background-width--inset:not(.content-collection):not(.gallery-section):not(.user-items-list-section) {
      padding-bottom: calc(var(--sqs-site-gutter) + 2vw);
    }
  


  .user-items-list-item-container[data-section-id="670c971bac109f1b60247a5d"] .list-item-content__title {
    font-size: 1.2rem;
  }
  .user-items-list-item-container[data-section-id="670c971bac109f1b60247a5d"] .list-item-content__description {
    font-size: 0.9rem;
  }
  .user-items-list-item-container[data-section-id="670c971bac109f1b60247a5d"] .list-item-content__button {
    font-size: 0.8rem;
  }

  @supports (--test-custom-property: true) {
    .user-items-list-item-container[data-section-id="670c971bac109f1b60247a5d"] {
      --title-font-size-value: 1.2;
      --body-font-size-value: 0.9;
      --button-font-size-value: 0.8;
    }
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
        <title>Other Services — Masjid AS-Salam  -  مسجد السلام</title>
        <style type="text/css">{styles}</style>
      </Helmet>
      <div className="content-wrapper">
        <div dangerouslySetInnerHTML={{ __html: `
    <div id="siteWrapper" className="clearfix site-wrapper">
      
        <div id="floatingCart" className="floating-cart hidden">
          <a href="/preview/25?path=cart%2Findex.html" className="icon icon--stroke icon--fill icon--cart sqs-custom-cart">
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
      
        
          white
        
      
      header theme-col--primary
    " data-section-theme="white" data-controller="Header" data-current-styles="{
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
                        <a id="site-title" href="/preview/25?path=index.html" data-animation-role="header-element">Masjid AS-Salam  -  مسجد السلام</a>
                      </div>
                    
                    
                  </div>
                
              
                
                <!-- Nav -->
                <div className="header-nav">
                  <div className="header-nav-wrapper">
                    <nav className="header-nav-list">
                      


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fjummah%2Findex.html" data-animation-role="header-element">
        خطبة الجمعة
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fjummah%2Findex.html" data-animation-role="header-element">
        Jummah
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fabout%2Findex.html" data-animation-role="header-element">
        About
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fabout%2Findex.html" data-animation-role="header-element">
        عن المسجد
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fservices%2Findex.html" data-animation-role="header-element">
        Services
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fservices%2Findex.html" data-animation-role="header-element">
        الخدمات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fevents%2Findex.html" data-animation-role="header-element">
        Events
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fevents%2Findex.html" data-animation-role="header-element">
        النشاطات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fresources%2Findex.html" data-animation-role="header-element">
        Resources
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fresources%2Findex.html" data-animation-role="header-element">
        المعلومات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fdonations%2Findex.html" data-animation-role="header-element">
        Donations
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fdonations%2Findex.html" data-animation-role="header-element">
        التبرعات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fcontact%2Findex.html" data-animation-role="header-element">
        Contact
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fcontact%2Findex.html" data-animation-role="header-element">
        اتصل بنا
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fimam-corner%2Findex.html" data-animation-role="header-element">
        Imam's Corner
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fimam-corner%2Findex.html" data-animation-role="header-element">
        ركن الإمام
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--folder">
      <a className="header-nav-folder-title" href="/preview/25?path=language%2Findex.html" tabindex="-1" data-animation-role="header-element">
      <span className="header-nav-folder-title-text">
        Language / اللغة
      </span>
      </a>
      <div className="header-nav-folder-content">
        
          
          
            <div className="header-nav-folder-item header-nav-folder-item--external">
              <a href="/preview/25?path=en%2Fhome%2Findex.html">English</a>
            </div>
          
        
          
          
            <div className="header-nav-folder-item header-nav-folder-item--external">
              <a href="/preview/25?path=ar%2Fhome%2Findex.html">العربية</a>
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
                        <a id="site-title" href="/preview/25?path=index.html" data-animation-role="header-element">Masjid AS-Salam  -  مسجد السلام</a>
                      </div>
                    
                    
                  </div>
                
              
                
                <!-- Nav -->
                <div className="header-nav">
                  <div className="header-nav-wrapper">
                    <nav className="header-nav-list">
                      


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fjummah%2Findex.html" data-animation-role="header-element">
        خطبة الجمعة
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fjummah%2Findex.html" data-animation-role="header-element">
        Jummah
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fabout%2Findex.html" data-animation-role="header-element">
        About
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fabout%2Findex.html" data-animation-role="header-element">
        عن المسجد
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fservices%2Findex.html" data-animation-role="header-element">
        Services
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fservices%2Findex.html" data-animation-role="header-element">
        الخدمات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fevents%2Findex.html" data-animation-role="header-element">
        Events
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fevents%2Findex.html" data-animation-role="header-element">
        النشاطات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fresources%2Findex.html" data-animation-role="header-element">
        Resources
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fresources%2Findex.html" data-animation-role="header-element">
        المعلومات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fdonations%2Findex.html" data-animation-role="header-element">
        Donations
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fdonations%2Findex.html" data-animation-role="header-element">
        التبرعات
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fcontact%2Findex.html" data-animation-role="header-element">
        Contact
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fcontact%2Findex.html" data-animation-role="header-element">
        اتصل بنا
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=en%2Fimam-corner%2Findex.html" data-animation-role="header-element">
        Imam's Corner
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--collection">
      <a href="/preview/25?path=ar%2Fimam-corner%2Findex.html" data-animation-role="header-element">
        ركن الإمام
      </a>
    </div>
  
  
  


  
    <div className="header-nav-item header-nav-item--folder">
      <a className="header-nav-folder-title" href="/preview/25?path=language%2Findex.html" tabindex="-1" data-animation-role="header-element">
      <span className="header-nav-folder-title-text">
        Language / اللغة
      </span>
      </a>
      <div className="header-nav-folder-content">
        
          
          
            <div className="header-nav-folder-item header-nav-folder-item--external">
              <a href="/preview/25?path=en%2Fhome%2Findex.html">English</a>
            </div>
          
        
          
          
            <div className="header-nav-folder-item header-nav-folder-item--external">
              <a href="/preview/25?path=ar%2Fhome%2Findex.html">العربية</a>
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
              <a href="/preview/25?path=ar%2Fjummah%2Findex.html">
                <div className="header-menu-nav-item-content">
                  خطبة الجمعة
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=en%2Fjummah%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Jummah
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=en%2Fabout%2Findex.html">
                <div className="header-menu-nav-item-content">
                  About
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=ar%2Fabout%2Findex.html">
                <div className="header-menu-nav-item-content">
                  عن المسجد
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=en%2Fservices%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Services
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=ar%2Fservices%2Findex.html">
                <div className="header-menu-nav-item-content">
                  الخدمات
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=en%2Fevents%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Events
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=ar%2Fevents%2Findex.html">
                <div className="header-menu-nav-item-content">
                  النشاطات
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=en%2Fresources%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Resources
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=ar%2Fresources%2Findex.html">
                <div className="header-menu-nav-item-content">
                  المعلومات
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=en%2Fdonations%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Donations
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=ar%2Fdonations%2Findex.html">
                <div className="header-menu-nav-item-content">
                  التبرعات
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=en%2Fcontact%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Contact
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=ar%2Fcontact%2Findex.html">
                <div className="header-menu-nav-item-content">
                  اتصل بنا
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=en%2Fimam-corner%2Findex.html">
                <div className="header-menu-nav-item-content">
                  Imam's Corner
                </div>
              </a>
            </div>
          
        
      
    
      
        
          
            <div className="container header-menu-nav-item header-menu-nav-item--collection">
              <a href="/preview/25?path=ar%2Fimam-corner%2Findex.html">
                <div className="header-menu-nav-item-content">
                  ركن الإمام
                </div>
              </a>
            </div>
          
        
      
    
      
        
          <div className="container header-menu-nav-item">
            <a data-folder-id="/language" href="/preview/25?path=language%2Findex.html">
              <div className="header-menu-nav-item-content header-menu-nav-item-content-folder">
                <span className="visually-hidden">Folder:</span>
                <span className="header-nav-folder-title-text">Language / اللغة</span>
              </div>
            </a>
          </div>
          <div data-folder="/language" className="header-menu-nav-folder">
            <div className="header-menu-nav-folder-content">
              <div className="header-menu-controls container header-menu-nav-item">
                <a className="header-menu-controls-control header-menu-controls-control--active" data-action="back" href="/preview/25?path=index.html">
                  <span>Back</span>
                </a>
              </div>
              
                
                
                  <div className="container header-menu-nav-item header-menu-nav-item--external">
                    <a href="/preview/25?path=en%2Fhome%2Findex.html">English</a>
                  </div>
                
              
                
                
                  <div className="container header-menu-nav-item header-menu-nav-item--external">
                    <a href="/preview/25?path=ar%2Fhome%2Findex.html">العربية</a>
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
        
          
<article className="sections" id="sections" data-page-sections="670c888a6355be10c1c91b00">
  
  
    
    


  
  


<section data-test="page-section" data-section-theme="white" className="page-section has-section-divider
    
      full-bleed-section
      layout-engine-section
    
    background-width--full-bleed
    
      section-height--small
    
    
      content-width--wide
    
    horizontal-alignment--center
    vertical-alignment--middle
    
       has-background
    
    
    white" data-section-id="670c97bb8fd4ee41efba3983" data-controller="SectionWrapperController" data-current-styles="{
&quot;backgroundImage&quot;: {
&quot;id&quot;: &quot;670f09c04d4e681f1ff60828&quot;,
&quot;recordType&quot;: 2,
&quot;addedOn&quot;: 1729038784934,
&quot;updatedOn&quot;: 1730574112830,
&quot;workflowState&quot;: 1,
&quot;publishOn&quot;: 1729038784934,
&quot;authorId&quot;: &quot;670b089229ece96fbbaf7110&quot;,
&quot;systemDataId&quot;: &quot;d1829359-9956-4f66-a654-72801a12e912&quot;,
&quot;systemDataVariants&quot;: &quot;4983x3322,100w,300w,500w,750w,1000w,1500w,2500w&quot;,
&quot;systemDataSourceType&quot;: &quot;JPG&quot;,
&quot;filename&quot;: &quot;bouquet-white-roses.jpg&quot;,
&quot;mediaFocalPoint&quot;: {
&quot;x&quot;: 0.5,
&quot;y&quot;: 0.5,
&quot;source&quot;: 3
},
&quot;colorData&quot;: {
&quot;topLeftAverage&quot;: &quot;fefefe&quot;,
&quot;topRightAverage&quot;: &quot;fefefe&quot;,
&quot;bottomLeftAverage&quot;: &quot;edf0f0&quot;,
&quot;bottomRightAverage&quot;: &quot;fafbfd&quot;,
&quot;centerAverage&quot;: &quot;fdfdfd&quot;,
&quot;suggestedBgColor&quot;: &quot;dbdccc&quot;
},
&quot;urlId&quot;: &quot;vkp22ld0hfbn6rzx6f863e6ncwnzva&quot;,
&quot;title&quot;: &quot;&quot;,
&quot;body&quot;: null,
&quot;likeCount&quot;: 0,
&quot;commentCount&quot;: 0,
&quot;publicCommentCount&quot;: 0,
&quot;commentState&quot;: 2,
&quot;unsaved&quot;: false,
&quot;author&quot;: {
&quot;id&quot;: &quot;670b089229ece96fbbaf7110&quot;,
&quot;displayName&quot;: &quot;Mahmoud Darwish&quot;,
&quot;firstName&quot;: &quot;Mahmoud&quot;,
&quot;lastName&quot;: &quot;Darwish&quot;,
&quot;bio&quot;: &quot;&quot;
},
&quot;assetUrl&quot;: &quot;https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg&quot;,
&quot;contentType&quot;: &quot;image/jpeg&quot;,
&quot;items&quot;: [ ],
&quot;pushedServices&quot;: { },
&quot;pendingPushedServices&quot;: { },
&quot;originalSize&quot;: &quot;4983x3322&quot;,
&quot;recordTypeLabel&quot;: &quot;image&quot;
},
&quot;imageOverlayOpacity&quot;: 0.61,
&quot;backgroundWidth&quot;: &quot;background-width--full-bleed&quot;,
&quot;sectionHeight&quot;: &quot;section-height--small&quot;,
&quot;customSectionHeight&quot;: 1,
&quot;horizontalAlignment&quot;: &quot;horizontal-alignment--center&quot;,
&quot;verticalAlignment&quot;: &quot;vertical-alignment--middle&quot;,
&quot;contentWidth&quot;: &quot;content-width--wide&quot;,
&quot;customContentWidth&quot;: 50,
&quot;sectionTheme&quot;: &quot;white&quot;,
&quot;sectionAnimation&quot;: &quot;none&quot;,
&quot;backgroundMode&quot;: &quot;image&quot;
}" data-current-context="{
&quot;video&quot;: {
&quot;playbackSpeed&quot;: 0.5,
&quot;filter&quot;: 2,
&quot;filterStrength&quot;: 0,
&quot;zoom&quot;: 0,
&quot;videoSourceProvider&quot;: &quot;none&quot;
},
&quot;backgroundImageId&quot;: null,
&quot;backgroundMediaEffect&quot;: {
&quot;type&quot;: &quot;none&quot;
},
&quot;divider&quot;: {
&quot;enabled&quot;: true,
&quot;type&quot;: &quot;rounded&quot;,
&quot;width&quot;: {
&quot;unit&quot;: &quot;vw&quot;,
&quot;value&quot;: 100.0
},
&quot;height&quot;: {
&quot;unit&quot;: &quot;vw&quot;,
&quot;value&quot;: 2.0
},
&quot;isFlipX&quot;: false,
&quot;isFlipY&quot;: false,
&quot;offset&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 0.0
},
&quot;stroke&quot;: {
&quot;style&quot;: &quot;none&quot;,
&quot;color&quot;: {
&quot;type&quot;: &quot;THEME_COLOR&quot;
},
&quot;thickness&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 6.0
},
&quot;dashLength&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 5.0
},
&quot;gapLength&quot;: {
&quot;unit&quot;: &quot;px&quot;,
&quot;value&quot;: 15.0
},
&quot;linecap&quot;: &quot;square&quot;
}
},
&quot;typeName&quot;: &quot;page&quot;
}" data-animation="none" data-fluid-engine-section="">
  <div className="section-border" data-controller="SectionDivider" style="clip-path: url(#section-divider-670c97bb8fd4ee41efba3983);">
    <div className="section-background">
    
      
        
        
          





  



<img alt="" data-src="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg" data-image="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg" data-image-dimensions="4983x3322" data-image-focal-point="0.5,0.5" data-load="false" elementtiming="nbf-background" src="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg" width="4983" height="3322" sizes="(max-width: 799px) 200vw, 100vw" style="display:block;object-position: 50% 50%" srcset="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg 100w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg 300w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg 500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg 750w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg 1000w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg 1500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/d1829359-9956-4f66-a654-72801a12e912/bouquet-white-roses.jpg 2500w" fetchpriority="high" loading="eager" decoding="async" data-loader="sqs">




        
        <div className="section-background-overlay" style="opacity: 0.61;"></div>
      
    
    </div>
  </div>
  <div className="content-wrapper" style="
      
        
      
    ">
    <div className="content">
      
      
      
      
      
      
      
      
      <div data-fluid-engine="true"><style>

.fe-670c97bb8fd4ee41efba3982 {
  --grid-gutter: calc(var(--sqs-mobile-site-gutter, 6vw) - 11.0px);
  --cell-max-width: calc( ( var(--sqs-site-max-width, 1500px) - (11.0px * (8 - 1)) ) / 8 );

  display: grid;
  position: relative;
  grid-area: 1/1/-1/-1;
  grid-template-rows: repeat(22,minmax(24px, auto));
  grid-template-columns:
    minmax(var(--grid-gutter), 1fr)
    repeat(8, minmax(0, var(--cell-max-width)))
    minmax(var(--grid-gutter), 1fr);
  row-gap: 11.0px;
  column-gap: 11.0px;
}

@media (min-width: 768px) {
  .background-width--inset .fe-670c97bb8fd4ee41efba3982 {
    --inset-padding: calc(var(--sqs-site-gutter) * 2);
  }

  .fe-670c97bb8fd4ee41efba3982 {
    --grid-gutter: calc(var(--sqs-site-gutter, 4vw) - 11.0px);
    --cell-max-width: calc( ( var(--sqs-site-max-width, 1500px) - (11.0px * (24 - 1)) ) / 24 );
    --inset-padding: 0vw;

    --row-height-scaling-factor: 0.0215;
    --container-width: min(var(--sqs-site-max-width, 1500px), calc(100vw - var(--sqs-site-gutter, 4vw) * 2 - var(--inset-padding) ));

    grid-template-rows: repeat(20,minmax(calc(var(--container-width) * var(--row-height-scaling-factor)), auto));
    grid-template-columns:
      minmax(var(--grid-gutter), 1fr)
      repeat(24, minmax(0, var(--cell-max-width)))
      minmax(var(--grid-gutter), 1fr);
  }
}


  .fe-block-fd20786419a2eec3f55e {
    grid-area: 1/2/12/10;
    z-index: 0;

    @media (max-width: 767px) {
      
    }
  }

  .fe-block-fd20786419a2eec3f55e .sqs-block {
    justify-content: center;
  }

  .fe-block-fd20786419a2eec3f55e .sqs-block-alignment-wrapper {
    align-items: center;
  }

  @media (min-width: 768px) {
    .fe-block-fd20786419a2eec3f55e {
      grid-area: 1/15/21/26;
      z-index: 0;

      
    }

    .fe-block-fd20786419a2eec3f55e .sqs-block {
      justify-content: center;
    }

    .fe-block-fd20786419a2eec3f55e .sqs-block-alignment-wrapper {
      align-items: center;
    }
  }

  .fe-block-6217f46352bc8fd65b55 {
    grid-area: 12/2/14/10;
    z-index: 1;

    @media (max-width: 767px) {
      
    }
  }

  .fe-block-6217f46352bc8fd65b55 .sqs-block {
    justify-content: center;
  }

  .fe-block-6217f46352bc8fd65b55 .sqs-block-alignment-wrapper {
    align-items: center;
  }

  @media (min-width: 768px) {
    .fe-block-6217f46352bc8fd65b55 {
      grid-area: 4/4/6/15;
      z-index: 1;

      
    }

    .fe-block-6217f46352bc8fd65b55 .sqs-block {
      justify-content: center;
    }

    .fe-block-6217f46352bc8fd65b55 .sqs-block-alignment-wrapper {
      align-items: center;
    }
  }

  .fe-block-45556c2a5d4a2fc2132a {
    grid-area: 14/2/21/9;
    z-index: 2;

    @media (max-width: 767px) {
      
    }
  }

  .fe-block-45556c2a5d4a2fc2132a .sqs-block {
    justify-content: flex-start;
  }

  .fe-block-45556c2a5d4a2fc2132a .sqs-block-alignment-wrapper {
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .fe-block-45556c2a5d4a2fc2132a {
      grid-area: 6/4/17/14;
      z-index: 2;

      
    }

    .fe-block-45556c2a5d4a2fc2132a .sqs-block {
      justify-content: flex-start;
    }

    .fe-block-45556c2a5d4a2fc2132a .sqs-block-alignment-wrapper {
      align-items: flex-start;
    }
  }

  .fe-block-8e87f5bf2a8812f4407c {
    grid-area: 21/2/23/6;
    z-index: 3;

    @media (max-width: 767px) {
      
    }
  }

  .fe-block-8e87f5bf2a8812f4407c .sqs-block {
    justify-content: center;
  }

  .fe-block-8e87f5bf2a8812f4407c .sqs-block-alignment-wrapper {
    align-items: center;
  }

  @media (min-width: 768px) {
    .fe-block-8e87f5bf2a8812f4407c {
      grid-area: 17/7/19/11;
      z-index: 3;

      
    }

    .fe-block-8e87f5bf2a8812f4407c .sqs-block {
      justify-content: center;
    }

    .fe-block-8e87f5bf2a8812f4407c .sqs-block-alignment-wrapper {
      align-items: center;
    }
  }

</style><div className="fluid-engine fe-670c97bb8fd4ee41efba3982"><div className="fe-block fe-block-fd20786419a2eec3f55e"><div className="sqs-block image-block sqs-block-image sqs-stretched" data-aspect-ratio="108.08401774428764" data-block-type="5" id="block-fd20786419a2eec3f55e"><div className="sqs-block-content">










































  

    
  
    <div className="
        image-block-outer-wrapper
        layout-caption-below
        design-layout-fluid
        image-position-right
        combination-animation-none
        individual-animation-none
      " data-test="image-block-fluid-outer-wrapper">
      <div className="fluid-image-animation-wrapper sqs-image sqs-block-alignment-wrapper" data-animation-role="image">
        <div className="fluid-image-container sqs-image-content" style="overflow: hidden;-webkit-mask-image: -webkit-radial-gradient(white, black);position: relative;width: 100%;height: 100%;">
          

          
          

          
            
              <div className="content-fill">
                
            
            
            
            
            
            
            <img data-stretch="true" data-src="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png" data-image="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png" data-image-dimensions="596x842" data-image-focal-point="0.5,0.5" alt="" data-load="false" elementtiming="system-image-block" src="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png" width="596" height="842" sizes="100vw" style="display:block;object-fit: cover; object-position: 50% 50%" srcset="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png 100w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png 300w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png 500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png 750w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png 1000w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png 1500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/21a90c07-fd7d-46eb-b1c7-e42fd8bff1b2/Marriage+Cert.png 2500w" loading="lazy" decoding="async" data-loader="sqs">

            
              
            
            <div className="fluidImageOverlay"></div>
          
              </div>
            
          

        </div>
      </div>
    </div>
    <style>
      .sqs-block-image .sqs-block-content {
        height: 100%;
        width: 100%;
      }

      
        .fe-block-fd20786419a2eec3f55e .fluidImageOverlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          mix-blend-mode: normal;
          
            
            
          
          
            opacity: 0;
          
        }
      
    </style>
  


  


</div></div></div><div className="fe-block fe-block-6217f46352bc8fd65b55"><div className="sqs-block html-block sqs-block-html" data-blend-mode="NORMAL" data-block-type="2" data-border-radii="{&quot;topLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;topRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0}}" id="block-6217f46352bc8fd65b55"><div className="sqs-block-content">

<div className="sqs-html-content">
  <h4 style="white-space:pre-wrap;">Marriage Services</h4>
</div>




















  
  



</div></div></div><div className="fe-block fe-block-45556c2a5d4a2fc2132a"><div className="sqs-block html-block sqs-block-html" data-blend-mode="NORMAL" data-block-type="2" data-border-radii="{&quot;topLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;topRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomLeft&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0},&quot;bottomRight&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;value&quot;:0.0}}" id="block-45556c2a5d4a2fc2132a"><div className="sqs-block-content">

<div className="sqs-html-content">
  <p className="" style="white-space:pre-wrap;">Congratulations  on your upcoming marriage. May Allah bless you and your family. Masjid  AS-Salam staff and Imam are glad to be a part of this wonderful  occasion. We want to make sure this will be a successful event for you  and your future spouse. Please read carefully the list below of what is  required to complete the process.</p><p className="" style="white-space:pre-wrap;">To initiate a nikah/marriage process please complete this list:</p><ol data-rte-list="default"><li><p className="" style="white-space:pre-wrap;">Obtain a marriage licence from the county court (it includes three copies: blue, pink, and white).</p></li><li><p className="" style="white-space:pre-wrap;">Schedule an appoint with staff and Imam.&nbsp;</p></li><li><p className="" style="white-space:pre-wrap;">Fees: There is an administrative fee of $100.00 .</p></li><li><p className="" style="white-space:pre-wrap;">&nbsp;Valid photo identification cards/passports for all involved in the signing of the contract.</p></li><li><p className="" style="white-space:pre-wrap;">The groom, the bride,&nbsp;bride's&nbsp;legal guardian, and two male&nbsp;witnesses must be present.</p></li></ol>
</div>




















  
  



</div></div></div><div className="fe-block fe-block-8e87f5bf2a8812f4407c"><div className="sqs-block button-block sqs-block-button sqs-stretched" data-block-type="53" id="block-8e87f5bf2a8812f4407c"><div className="sqs-block-content">

<div className="sqs-block-button-container sqs-block-button-container--left" data-animation-role="button" data-alignment="left" data-button-size="medium" data-button-type="primary">
  <a href="/preview/25?path=en%2Fcontact%2Findex.html" className="sqs-block-button-element--medium sqs-button-element--primary sqs-block-button-element">
    Contact Us
  </a>
</div>
</div></div></div></div></div>
    </div>
  
  </div>
  


<div className="section-divider-display" style="
    --stroke-thickness: 0;
    --stroke-dasharray: 0;
    --stroke-linecap: square;
    
      
    
  ">
  <style>
    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] {
      padding-bottom: var(--divider-height);
      z-index: var(--z-index);
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] .background-pause-button {
      bottom: calc(14px + var(--divider-height));
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] .section-divider-svg-clip {
      display: block;
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"].background-width--inset:not(.content-collection):not(.gallery-section):not(.user-items-list-section) {
      padding-bottom: calc(var(--sqs-site-gutter) + var(--divider-height));
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"].background-width--inset:not(.content-collection):not(.gallery-section):not(.user-items-list-section) .section-background {
      bottom: calc(var(--sqs-site-gutter) + var(--divider-height));
    }

    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] .section-divider-block {
      height: var(--divider-height);
    }
  </style>
  
  <style data-section-divider-style="">
    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"] {
      padding-bottom: 2vw;
    }
    .has-section-divider[data-section-id="670c97bb8fd4ee41efba3983"].background-width--inset:not(.content-collection):not(.gallery-section):not(.user-items-list-section) {
      padding-bottom: calc(var(--sqs-site-gutter) + 2vw);
    }
  </style>
  <div className="section-divider-block"></div>
  <svg className="section-divider-svg-clip">
    <clipPath id="section-divider-670c97bb8fd4ee41efba3983" clipPathUnits="objectBoundingBox">
      <path className="section-divider-clip" d="M0,0"></path>
    </clipPath>
  </svg>
  <svg className="section-divider-svg-stroke" viewBox="0 0 1 1" preserveAspectRatio="none">
    <path className="section-divider-stroke" d="M0,0" vector-effect="non-scaling-stroke"></path>
  </svg>
</div>

</section>

  
    
    


  
  


<section data-test="page-section" data-section-theme="white" className="page-section 
    
      user-items-list-section
      full-bleed-section
    
    
    
      
    
    
      
    
    
    
    
      
    
    
    white" data-section-id="670c971bac109f1b60247a5d" data-controller="SectionWrapperController" data-current-styles="{
&quot;imageFocalPoint&quot;: {
&quot;x&quot;: 0.5,
&quot;y&quot;: 0.5
},
&quot;imageOverlayOpacity&quot;: 0.3,
&quot;backgroundColor&quot;: &quot;white&quot;,
&quot;sectionTheme&quot;: &quot;white&quot;,
&quot;imageEffect&quot;: &quot;none&quot;,
&quot;backgroundMode&quot;: &quot;image&quot;,
&quot;backgroundImage&quot;: null
}" data-current-context="{
&quot;video&quot;: {
&quot;filter&quot;: 1,
&quot;videoFallbackContentItem&quot;: null,
&quot;nativeVideoContentItem&quot;: null,
&quot;videoSourceProvider&quot;: &quot;none&quot;
},
&quot;backgroundImageId&quot;: null,
&quot;backgroundMediaEffect&quot;: {
&quot;type&quot;: &quot;none&quot;
},
&quot;divider&quot;: {
&quot;enabled&quot;: false
},
&quot;typeName&quot;: &quot;page&quot;
}" data-animation="" data-json-schema-section="">
  <div className="section-border">
    <div className="section-background">
    
      
    
    </div>
  </div>
  <div className="content-wrapper" style="
      
        
      
    ">
    <div className="content">
      
      
      
      
      
      
      
        


















<div className="user-items-list" style="
    min-height: 100px;
    padding-top: 10vmax;
    padding-bottom: 10vmax;
    " data-card-theme="" data-section-id="user-items-list" data-section-title-enabled="true" data-space-below-section-title-value="70" data-space-below-section-title-unit="px" data-layout-width="inset">
  
    
    <div className="list-section-title" id="670c971bac109f1b60247a5d" style="padding-bottom: 70px;" data-section-title-alignment="center">
      <p>More Services</p>
    </div>
  

  
    







































<style>
  .user-items-list-item-container[data-section-id="670c971bac109f1b60247a5d"] .list-item-content__title {
    font-size: 1.2rem;
  }
  .user-items-list-item-container[data-section-id="670c971bac109f1b60247a5d"] .list-item-content__description {
    font-size: 0.9rem;
  }
  .user-items-list-item-container[data-section-id="670c971bac109f1b60247a5d"] .list-item-content__button {
    font-size: 0.8rem;
  }

  @supports (--test-custom-property: true) {
    .user-items-list-item-container[data-section-id="670c971bac109f1b60247a5d"] {
      --title-font-size-value: 1.2;
      --body-font-size-value: 0.9;
      --button-font-size-value: 0.8;
    }
  }
</style>


<ul className="
    user-items-list-item-container
    user-items-list-simple
  " style="
    grid-gap: 100px 100px;
  " data-controller="UserItemsListSimple" data-num-columns="3" data-content-order="media-first" data-alignment-vertical="top" data-section-id="670c971bac109f1b60247a5d" data-current-context="{
&quot;userItems&quot;: [ {
&quot;title&quot;: &quot;Job Seeking&quot;,
&quot;description&quot;: &quot;<p><strong>Job service tries to connect job seekers with help wanted in the community or near by. There are also jobs posted on the news boards to search and call.<\/strong><\/p>&quot;,
&quot;button&quot;: {
&quot;buttonText&quot;: &quot;Make It&quot;,
&quot;buttonLink&quot;: &quot;#&quot;
},
&quot;imageId&quot;: &quot;670c9dce3c101f06680fecac&quot;,
&quot;image&quot;: {
&quot;id&quot;: &quot;670c9dce3c101f06680fecac&quot;,
&quot;recordType&quot;: 2,
&quot;addedOn&quot;: 1728880078702,
&quot;updatedOn&quot;: 1730574119805,
&quot;workflowState&quot;: 1,
&quot;publishOn&quot;: 1728880078702,
&quot;authorId&quot;: &quot;670b089229ece96fbbaf7110&quot;,
&quot;systemDataId&quot;: &quot;95d7edb9-4ad7-4ae4-b7fc-e2e293238c13&quot;,
&quot;systemDataVariants&quot;: &quot;4033x3753,100w,300w,500w,750w,1000w,1500w,2500w&quot;,
&quot;systemDataSourceType&quot;: &quot;JPG&quot;,
&quot;filename&quot;: &quot;wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg&quot;,
&quot;mediaFocalPoint&quot;: {
&quot;x&quot;: 0.5,
&quot;y&quot;: 0.5,
&quot;source&quot;: 3
},
&quot;colorData&quot;: {
&quot;topLeftAverage&quot;: &quot;b0dbf1&quot;,
&quot;topRightAverage&quot;: &quot;bce3f9&quot;,
&quot;bottomLeftAverage&quot;: &quot;96bfd2&quot;,
&quot;bottomRightAverage&quot;: &quot;add9ed&quot;,
&quot;centerAverage&quot;: &quot;b0d7e8&quot;,
&quot;suggestedBgColor&quot;: &quot;b0cdd4&quot;
},
&quot;urlId&quot;: &quot;lx0jca5ak3vdl9on8g09qnqndadyf2&quot;,
&quot;title&quot;: &quot;&quot;,
&quot;body&quot;: null,
&quot;likeCount&quot;: 0,
&quot;commentCount&quot;: 0,
&quot;publicCommentCount&quot;: 0,
&quot;commentState&quot;: 2,
&quot;unsaved&quot;: false,
&quot;author&quot;: {
&quot;id&quot;: &quot;670b089229ece96fbbaf7110&quot;,
&quot;displayName&quot;: &quot;Mahmoud Darwish&quot;,
&quot;firstName&quot;: &quot;Mahmoud&quot;,
&quot;lastName&quot;: &quot;Darwish&quot;,
&quot;bio&quot;: &quot;&quot;
},
&quot;assetUrl&quot;: &quot;https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg&quot;,
&quot;contentType&quot;: &quot;image/jpeg&quot;,
&quot;items&quot;: [ ],
&quot;pushedServices&quot;: { },
&quot;pendingPushedServices&quot;: { },
&quot;originalSize&quot;: &quot;4033x3753&quot;,
&quot;recordTypeLabel&quot;: &quot;image&quot;
}
}, {
&quot;title&quot;: &quot;Housing Help&quot;,
&quot;description&quot;: &quot;<p><strong>Housing service tries to connect housing seeker with landlords or other who are looking to share their apartment. There are also housing help posted on the news boards to search and call.<\/strong><\/p>&quot;,
&quot;button&quot;: {
&quot;buttonText&quot;: &quot;Make It&quot;
},
&quot;imageId&quot;: &quot;670c9de26355be10c1ccfbb4&quot;,
&quot;image&quot;: {
&quot;id&quot;: &quot;670c9de26355be10c1ccfbb4&quot;,
&quot;recordType&quot;: 2,
&quot;addedOn&quot;: 1728880098219,
&quot;updatedOn&quot;: 1730574119809,
&quot;workflowState&quot;: 1,
&quot;publishOn&quot;: 1728880098219,
&quot;authorId&quot;: &quot;670b089229ece96fbbaf7110&quot;,
&quot;systemDataId&quot;: &quot;fed07249-e82b-44ef-bc23-242d55bb1052&quot;,
&quot;systemDataVariants&quot;: &quot;5000x3337,100w,300w,500w,750w,1000w,1500w,2500w&quot;,
&quot;systemDataSourceType&quot;: &quot;JPG&quot;,
&quot;filename&quot;: &quot;real-estate-housing-brokerage-concept.jpg&quot;,
&quot;mediaFocalPoint&quot;: {
&quot;x&quot;: 0.5,
&quot;y&quot;: 0.5,
&quot;source&quot;: 3
},
&quot;colorData&quot;: {
&quot;topLeftAverage&quot;: &quot;8f898c&quot;,
&quot;topRightAverage&quot;: &quot;c4a77c&quot;,
&quot;bottomLeftAverage&quot;: &quot;8d9795&quot;,
&quot;bottomRightAverage&quot;: &quot;594836&quot;,
&quot;centerAverage&quot;: &quot;938a8b&quot;,
&quot;suggestedBgColor&quot;: &quot;b5b0a6&quot;
},
&quot;urlId&quot;: &quot;w98gx7virte6dasforoyhajwiqqc9z&quot;,
&quot;title&quot;: &quot;&quot;,
&quot;body&quot;: null,
&quot;likeCount&quot;: 0,
&quot;commentCount&quot;: 0,
&quot;publicCommentCount&quot;: 0,
&quot;commentState&quot;: 2,
&quot;unsaved&quot;: false,
&quot;author&quot;: {
&quot;id&quot;: &quot;670b089229ece96fbbaf7110&quot;,
&quot;displayName&quot;: &quot;Mahmoud Darwish&quot;,
&quot;firstName&quot;: &quot;Mahmoud&quot;,
&quot;lastName&quot;: &quot;Darwish&quot;,
&quot;bio&quot;: &quot;&quot;
},
&quot;assetUrl&quot;: &quot;https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg&quot;,
&quot;contentType&quot;: &quot;image/jpeg&quot;,
&quot;items&quot;: [ ],
&quot;pushedServices&quot;: { },
&quot;pendingPushedServices&quot;: { },
&quot;originalSize&quot;: &quot;5000x3337&quot;,
&quot;recordTypeLabel&quot;: &quot;image&quot;
}
}, {
&quot;title&quot;: &quot;Marriage Counseling&quot;,
&quot;description&quot;: &quot;<p><strong>We provide marriage counseling service upon request. Please contact for more details to know if this is the right service your and/or your spouse.<\/strong><\/p>&quot;,
&quot;button&quot;: {
&quot;buttonText&quot;: &quot;Make It&quot;
},
&quot;imageId&quot;: &quot;670c9dfecd16b41e75b06d4e&quot;,
&quot;image&quot;: {
&quot;id&quot;: &quot;670c9dfecd16b41e75b06d4e&quot;,
&quot;recordType&quot;: 2,
&quot;addedOn&quot;: 1728880126545,
&quot;updatedOn&quot;: 1730574119813,
&quot;workflowState&quot;: 1,
&quot;publishOn&quot;: 1728880126545,
&quot;authorId&quot;: &quot;670b089229ece96fbbaf7110&quot;,
&quot;systemDataId&quot;: &quot;61507653-d476-4782-ae0d-dd697815e950&quot;,
&quot;systemDataVariants&quot;: &quot;3264x5824,100w,300w,500w,750w,1000w,1500w,2500w&quot;,
&quot;systemDataSourceType&quot;: &quot;JPG&quot;,
&quot;filename&quot;: &quot;there-are-two-people-sitting-rug-looking-out-window.jpg&quot;,
&quot;mediaFocalPoint&quot;: {
&quot;x&quot;: 0.5,
&quot;y&quot;: 0.5,
&quot;source&quot;: 3
},
&quot;colorData&quot;: {
&quot;topLeftAverage&quot;: &quot;1f1b17&quot;,
&quot;topRightAverage&quot;: &quot;55544c&quot;,
&quot;bottomLeftAverage&quot;: &quot;645f4d&quot;,
&quot;bottomRightAverage&quot;: &quot;655f4c&quot;,
&quot;centerAverage&quot;: &quot;b1a982&quot;,
&quot;suggestedBgColor&quot;: &quot;676150&quot;
},
&quot;urlId&quot;: &quot;fc4k6ffhnfaya3jfhfnzofo5k4l57f&quot;,
&quot;title&quot;: &quot;&quot;,
&quot;body&quot;: null,
&quot;likeCount&quot;: 0,
&quot;commentCount&quot;: 0,
&quot;publicCommentCount&quot;: 0,
&quot;commentState&quot;: 2,
&quot;unsaved&quot;: false,
&quot;author&quot;: {
&quot;id&quot;: &quot;670b089229ece96fbbaf7110&quot;,
&quot;displayName&quot;: &quot;Mahmoud Darwish&quot;,
&quot;firstName&quot;: &quot;Mahmoud&quot;,
&quot;lastName&quot;: &quot;Darwish&quot;,
&quot;bio&quot;: &quot;&quot;
},
&quot;assetUrl&quot;: &quot;https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg&quot;,
&quot;contentType&quot;: &quot;image/jpeg&quot;,
&quot;items&quot;: [ ],
&quot;pushedServices&quot;: { },
&quot;pendingPushedServices&quot;: { },
&quot;originalSize&quot;: &quot;3264x5824&quot;,
&quot;recordTypeLabel&quot;: &quot;image&quot;
}
} ],
&quot;styles&quot;: {
&quot;imageFocalPoint&quot;: {
&quot;x&quot;: 0.5,
&quot;y&quot;: 0.5
},
&quot;imageOverlayOpacity&quot;: 0.3,
&quot;backgroundColor&quot;: &quot;white&quot;,
&quot;sectionTheme&quot;: &quot;white&quot;,
&quot;imageEffect&quot;: &quot;none&quot;,
&quot;backgroundMode&quot;: &quot;image&quot;,
&quot;backgroundImage&quot;: null
},
&quot;video&quot;: {
&quot;filter&quot;: 1,
&quot;videoFallbackContentItem&quot;: null,
&quot;nativeVideoContentItem&quot;: null,
&quot;videoSourceProvider&quot;: &quot;none&quot;
},
&quot;backgroundImageFocalPoint&quot;: null,
&quot;backgroundImageId&quot;: null,
&quot;options&quot;: {
&quot;maxColumns&quot;: 3,
&quot;isCardEnabled&quot;: false,
&quot;isMediaEnabled&quot;: true,
&quot;isTitleEnabled&quot;: true,
&quot;isBodyEnabled&quot;: true,
&quot;isButtonEnabled&quot;: false,
&quot;mediaAspectRatio&quot;: &quot;4:3&quot;,
&quot;layoutWidth&quot;: &quot;inset&quot;,
&quot;mediaWidth&quot;: {
&quot;value&quot;: 100,
&quot;unit&quot;: &quot;%&quot;
},
&quot;mediaAlignment&quot;: &quot;center&quot;,
&quot;contentWidth&quot;: {
&quot;value&quot;: 100,
&quot;unit&quot;: &quot;%&quot;
},
&quot;titleAlignment&quot;: &quot;center&quot;,
&quot;bodyAlignment&quot;: &quot;center&quot;,
&quot;buttonAlignment&quot;: &quot;center&quot;,
&quot;titlePlacement&quot;: &quot;center&quot;,
&quot;bodyPlacement&quot;: &quot;center&quot;,
&quot;buttonPlacement&quot;: &quot;center&quot;,
&quot;cardVerticalAlignment&quot;: &quot;top&quot;,
&quot;contentOrder&quot;: &quot;media-first&quot;,
&quot;verticalPaddingTop&quot;: {
&quot;value&quot;: 10,
&quot;unit&quot;: &quot;vmax&quot;
},
&quot;verticalPaddingBottom&quot;: {
&quot;value&quot;: 10,
&quot;unit&quot;: &quot;vmax&quot;
},
&quot;spaceBetweenColumns&quot;: {
&quot;value&quot;: 100,
&quot;unit&quot;: &quot;px&quot;
},
&quot;spaceBetweenRows&quot;: {
&quot;value&quot;: 100,
&quot;unit&quot;: &quot;px&quot;
},
&quot;spaceBetweenContentAndMedia&quot;: {
&quot;value&quot;: 6,
&quot;unit&quot;: &quot;%&quot;
},
&quot;spaceBelowTitle&quot;: {
&quot;value&quot;: 6,
&quot;unit&quot;: &quot;%&quot;
},
&quot;spaceBelowBody&quot;: {
&quot;value&quot;: 6,
&quot;unit&quot;: &quot;%&quot;
},
&quot;cardPaddingTop&quot;: {
&quot;value&quot;: 20,
&quot;unit&quot;: &quot;px&quot;
},
&quot;cardPaddingRight&quot;: {
&quot;value&quot;: 20,
&quot;unit&quot;: &quot;px&quot;
},
&quot;cardPaddingBottom&quot;: {
&quot;value&quot;: 20,
&quot;unit&quot;: &quot;px&quot;
},
&quot;cardPaddingLeft&quot;: {
&quot;value&quot;: 20,
&quot;unit&quot;: &quot;px&quot;
},
&quot;titleFontSize&quot;: &quot;heading-2&quot;,
&quot;bodyFontSize&quot;: &quot;paragraph-2&quot;,
&quot;buttonFontSize&quot;: &quot;button-medium&quot;,
&quot;customOptions&quot;: {
&quot;customTitleFontSize&quot;: {
&quot;value&quot;: 1.2,
&quot;unit&quot;: &quot;rem&quot;
},
&quot;customBodyFontSize&quot;: {
&quot;value&quot;: 0.9,
&quot;unit&quot;: &quot;rem&quot;
},
&quot;customButtonFontSize&quot;: {
&quot;value&quot;: 0.8,
&quot;unit&quot;: &quot;rem&quot;
}
}
},
&quot;layout&quot;: &quot;simple&quot;,
&quot;isSectionTitleEnabled&quot;: true,
&quot;sectionTitle&quot;: &quot;<p>More Services<\/p>&quot;,
&quot;spaceBelowSectionTitle&quot;: {
&quot;value&quot;: 70,
&quot;unit&quot;: &quot;px&quot;
},
&quot;sectionTitleAlignment&quot;: &quot;center&quot;,
&quot;isSectionButtonEnabled&quot;: true,
&quot;sectionButton&quot;: {
&quot;buttonText&quot;: &quot;Contact Us&quot;,
&quot;buttonLink&quot;: &quot;/en/contact&quot;,
&quot;buttonNewWindow&quot;: false
},
&quot;sectionButtonSize&quot;: &quot;medium&quot;,
&quot;sectionButtonAlignment&quot;: &quot;center&quot;,
&quot;spaceAboveSectionButton&quot;: {
&quot;value&quot;: 70,
&quot;unit&quot;: &quot;px&quot;
}
}" data-media-alignment="center" data-title-alignment="center" data-body-alignment="center" data-button-alignment="center" data-title-placement="center" data-body-placement="center" data-button-placement="center" data-layout-width="inset" data-title-font-unit="rem" data-description-font-unit="rem" data-button-font-unit="rem" data-space-between-rows="100px" data-space-between-columns="100px" data-vertical-padding-top-value="10" data-vertical-padding-bottom-value="10" data-vertical-padding-top-unit="vmax" data-vertical-padding-bottom-unit="vmax">
  
    
    <li className="
        list-item
        
      " style="
        
      " data-is-card-enabled="false">
      
      
      
        
  
      <div className="list-item-media" style="
          
            margin-bottom: 6%;
          
          width: 100%;
        ">
        <div className="list-item-media-inner" data-aspect-ratio="4:3" data-animation-role="image">
<img alt="" data-src="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg" data-image="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg" data-image-dimensions="4033x3753" data-image-focal-point="0.5,0.5" data-load="false" elementtiming="nbf-list-simple" src="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg" width="4033" height="3753" sizes="(max-width: 575px) calc((100vw - 0px) / 1), (max-width: 767px) calc((100vw - 100px) / 2), (max-width: 1099px) calc((100vw - 200px) / 3), (max-width: 1199px) calc((100vw - 200px) / 3), calc((100vw - 200px) / 3)" className="list-image" style="display:block;object-position: 50% 50%;" srcset="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg 100w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg 300w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg 500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg 750w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg 1000w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg 1500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/95d7edb9-4ad7-4ae4-b7fc-e2e293238c13/wooden-men-magnifying-glass-blue-background-recruitment-concept-search-talented-capable-employees-career-growth-flat-lay.jpg 2500w" loading="lazy" decoding="async" data-loader="sqs"></div>
      </div>
  


        <div className="list-item-content">

  
    <div className="list-item-content__text-wrapper">

      
        <h2 className="list-item-content__title" style="max-width: 100%;">Job Seeking</h2>
      

      
        <div className="list-item-content__description
          
          " style="
            margin-top: 6%;
            max-width: 100%;
          ">
          <p><strong>Job service tries to connect job seekers with help wanted in the community or near by. There are also jobs posted on the news boards to search and call.</strong></p>
        </div>
      

    </div>
  

  
</div>

      
      
    </li>
  
    
    <li className="
        list-item
        
      " style="
        
      " data-is-card-enabled="false">
      
      
      
        
  
      <div className="list-item-media" style="
          
            margin-bottom: 6%;
          
          width: 100%;
        ">
        <div className="list-item-media-inner" data-aspect-ratio="4:3" data-animation-role="image">
<img alt="" data-src="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg" data-image="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg" data-image-dimensions="5000x3337" data-image-focal-point="0.5,0.5" data-load="false" elementtiming="nbf-list-simple" src="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg" width="5000" height="3337" sizes="(max-width: 575px) calc((100vw - 0px) / 1 * 1.1237638597542703), (max-width: 767px) calc((100vw - 100px) / 2 * 1.1237638597542703), (max-width: 1099px) calc((100vw - 200px) / 3 * 1.1237638597542703), (max-width: 1199px) calc((100vw - 200px) / 3 * 1.1237638597542703), calc((100vw - 200px) / 3 * 1.1237638597542703)" className="list-image" style="display:block;object-position: 50% 50%;" srcset="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg 100w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg 300w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg 500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg 750w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg 1000w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg 1500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/fed07249-e82b-44ef-bc23-242d55bb1052/real-estate-housing-brokerage-concept.jpg 2500w" loading="lazy" decoding="async" data-loader="sqs"></div>
      </div>
  


        <div className="list-item-content">

  
    <div className="list-item-content__text-wrapper">

      
        <h2 className="list-item-content__title" style="max-width: 100%;">Housing Help</h2>
      

      
        <div className="list-item-content__description
          
          " style="
            margin-top: 6%;
            max-width: 100%;
          ">
          <p><strong>Housing service tries to connect housing seeker with landlords or other who are looking to share their apartment. There are also housing help posted on the news boards to search and call.</strong></p>
        </div>
      

    </div>
  

  
</div>

      
      
    </li>
  
    
    <li className="
        list-item
        
      " style="
        
      " data-is-card-enabled="false">
      
      
      
        
  
      <div className="list-item-media" style="
          
            margin-bottom: 6%;
          
          width: 100%;
        ">
        <div className="list-item-media-inner" data-aspect-ratio="4:3" data-animation-role="image">
<img alt="" data-src="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg" data-image="https://images.squarespace-cdn.com/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg" data-image-dimensions="3264x5824" data-image-focal-point="0.5,0.5" data-load="false" elementtiming="nbf-list-simple" src="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg" width="3264" height="5824" sizes="(max-width: 575px) calc((100vw - 0px) / 1), (max-width: 767px) calc((100vw - 100px) / 2), (max-width: 1099px) calc((100vw - 200px) / 3), (max-width: 1199px) calc((100vw - 200px) / 3), calc((100vw - 200px) / 3)" className="list-image" style="display:block;object-position: 50% 50%;" srcset="/api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg 100w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg 300w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg 500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg 750w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg 1000w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg 1500w, /api/assets/25/assets/content/v1/670b091e205af92c7bb1963a/61507653-d476-4782-ae0d-dd697815e950/there-are-two-people-sitting-rug-looking-out-window.jpg 2500w" loading="lazy" decoding="async" data-loader="sqs"></div>
      </div>
  


        <div className="list-item-content">

  
    <div className="list-item-content__text-wrapper">

      
        <h2 className="list-item-content__title" style="max-width: 100%;">Marriage Counseling</h2>
      

      
        <div className="list-item-content__description
          
          " style="
            margin-top: 6%;
            max-width: 100%;
          ">
          <p><strong>We provide marriage counseling service upon request. Please contact for more details to know if this is the right service your and/or your spouse.</strong></p>
        </div>
      

    </div>
  

  
</div>

      
      
    </li>
  
</ul>

  

  

  

  
    <div className="list-section-button-container" style="margin-top: 70px;" data-section-button-alignment="center" data-button-size="medium" data-animation-role="button">
      <a className="
          list-section-button
          sqs-block-button-element
          
          
            sqs-block-button-element--medium
            sqs-button-element--primary
          
        " href="/preview/25?path=en%2Fcontact%2Findex.html">
        Contact Us
      </a>
    </div>
    
  
</div>

      
      
      
    </div>
  
  </div>
  
</section>

  
</article>


          

          
            
          
        
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
&quot;typeName&quot;: &quot;page&quot;
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

    <script defer="true" src="/api/assets/25/assets/static/vta/5c5a519771c10ba3470d8101/scripts/site-bundle.eb4526b19b26a261df1b48c8d6036e5e.js" type="text/javascript"></script>
    <script src="/api/assets/25/assets/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
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
