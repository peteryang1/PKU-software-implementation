using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.IO;
using System.Text;
using System;
using LitJson;

public class ButtonBack : MonoBehaviour {

	public Button mButton;
	public Text contentText;
	public InputField inputField;
	// Use this for initialization
	void Start () {
		Button btn = mButton.GetComponent<Button> ();
		btn.onClick.AddListener(TaskOnClick);
	
}

	// Update is called once per frame
	void TaskOnClick () {
		  Application.LoadLevel (0);
      }

		
	}
	
	

